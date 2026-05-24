import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function formatWhatsAppNumber(phone: string): string | null {
  const trimmed = phone.trim();

  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return null;
    return `whatsapp:+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return `whatsapp:+91${digits}`;
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return `whatsapp:+${digits}`;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[send-reminder] Function invoked, method:", req.method);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("[send-reminder] Missing or invalid Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !anonKey) {
      console.error("[send-reminder] Missing Supabase env vars", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasAnonKey: !!anonKey,
      });
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      console.error("[send-reminder] Auth failed:", userError?.message ?? "No user");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[send-reminder] Authenticated user:", user.id);

    const { data: roleData, error: roleError } = await supabase.rpc("get_user_role", { _user_id: user.id });
    if (roleError) {
      console.error("[send-reminder] Role check error:", roleError.message);
    }
    if (roleData !== "admin") {
      console.error("[send-reminder] Not admin. Role:", roleData);
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let studentIds: string[] | undefined;
    try {
      const body = await req.json();
      studentIds = body?.studentIds;
    } catch {
      // Empty body is fine
    }

    // Validate studentIds input
    if (studentIds !== undefined) {
      if (!Array.isArray(studentIds)) {
        return new Response(JSON.stringify({ error: "Invalid request format." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (studentIds.length > 100) {
        return new Response(JSON.stringify({ error: "Too many students selected. Maximum 100 per request." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!studentIds.every(id => typeof id === "string" && uuidRegex.test(id))) {
        return new Response(JSON.stringify({ error: "Invalid student IDs provided." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id,name,total_fee,paid_amount,parent_phone,student_phone,joining_date")
      .order("created_at", { ascending: false });

    if (studentsError) {
      console.error("[send-reminder] Error fetching students:", studentsError.message);
      return new Response(JSON.stringify({ error: "Failed to fetch student data." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allStudents = students || [];
    console.log("[send-reminder] Total students fetched:", allStudents.length);

    let targetStudents = allStudents;
    if (studentIds && studentIds.length > 0) {
      const uniqueIds = [...new Set(studentIds)];
      targetStudents = targetStudents.filter((s: any) => uniqueIds.includes(s.id));
      console.log("[send-reminder] Filtered by IDs:", targetStudents.length);
    } else {
      targetStudents = targetStudents.filter((s: any) => (Number(s.total_fee) - Number(s.paid_amount)) > 0);
      console.log("[send-reminder] Filtered by due fees:", targetStudents.length);
    }

    if (targetStudents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No students with pending fees found", sent: 0, failed: 0, matched: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Twilio credentials ---
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_WHATSAPP_FROM");

    console.log("[send-reminder] Twilio config check:", {
      hasAccountSid: !!accountSid,
      hasSidLength: accountSid?.length ?? 0,
      hasAuthToken: !!authToken,
      hasFrom: !!fromNumber,
      fromValue: fromNumber ?? "(not set)",
    });

    if (!accountSid || !authToken || !fromNumber) {
      return new Response(
        JSON.stringify({ error: "Messaging service not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const skipped: string[] = [];
    let attemptedCount = 0;

    for (const student of targetStudents) {
      const remaining = Number(student.total_fee) - Number(student.paid_amount);
      if (remaining <= 0) continue;

      // Read raw phone and log it for debugging
      const rawPhone = student.parent_phone || student.student_phone || "";
      console.log(`[send-reminder] Raw phone for ${student.name}: "${rawPhone}"`);

      // Strip "whatsapp:" prefix if stored in DB with it
      let phone = rawPhone.trim();
      if (phone.toLowerCase().startsWith("whatsapp:")) {
        phone = phone.substring("whatsapp:".length).trim();
      }

      if (!phone || !isValidPhone(phone)) {
        skipped.push(`${student.name}: Invalid or missing phone number (raw: "${rawPhone}")`);
        failedCount++;
        continue;
      }

      const whatsappTo = formatWhatsAppNumber(phone);
      if (!whatsappTo) {
        skipped.push(`${student.name}: Could not format phone number (cleaned: "${phone}")`);
        failedCount++;
        continue;
      }

      attemptedCount++;

      const whatsappFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
      const message = `Dear Parent, Your child ${student.name} joined on ${student.joining_date}. Remaining fees ₹${remaining}. Kindly pay at the earliest. - E-Academy Pro`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: whatsappTo,
        From: whatsappFrom,
        Body: message,
      });

      console.log(`[send-reminder] Sending to ${whatsappTo} for student ${student.name} (remaining: ₹${remaining})`);

      try {
        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        });

        const responseText = await response.text();
        console.log(`[send-reminder] Twilio response for ${student.name}: status=${response.status}`);

        if (response.ok) {
          sentCount++;
          console.log(`[send-reminder] ✅ Sent successfully to ${whatsappTo} for ${student.name}`);
        } else {
          let errMsg = "Message could not be delivered";
          try {
            const errData = JSON.parse(responseText);
            const twilioMessage = String(errData.message || errData.error_message || "");

            console.error(`[send-reminder] ❌ Twilio error for ${student.name}:`, {
              status: response.status,
              code: errData.code,
              twilioMessage,
              to: whatsappTo,
              from: whatsappFrom,
            });

            if (twilioMessage.toLowerCase().includes("daily messages limit")) {
              errMsg = "Twilio daily limit reached";
            } else if (twilioMessage.toLowerCase().includes("not a valid")) {
              errMsg = "Number not registered on WhatsApp";
            } else if (twilioMessage.toLowerCase().includes("sandbox")) {
              errMsg = "WhatsApp sandbox not joined";
            } else if (errData.code === 21608) {
              errMsg = "Number has not opted in to sandbox";
            } else if (errData.code === 21211) {
              errMsg = "Invalid phone number";
            } else {
              errMsg = twilioMessage || `Twilio error code ${errData.code || response.status}`;
            }
          } catch {
            console.error(`[send-reminder] ❌ Twilio non-JSON error for ${student.name}:`, {
              status: response.status,
              body: responseText.slice(0, 200),
            });
          }
          errors.push(`${student.name}: ${errMsg}`);
          failedCount++;
        }
      } catch (e) {
        console.error(`[send-reminder] ❌ Network error for ${student.name}:`, e);
        errors.push(`${student.name}: Network error`);
        failedCount++;
      }
    }

    console.log("[send-reminder] === COMPLETED ===", {
      matched: targetStudents.length,
      attempted: attemptedCount,
      sent: sentCount,
      failed: failedCount,
      skipped: skipped.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        matched: targetStudents.length,
        attempted: attemptedCount,
        sent: sentCount,
        failed: failedCount,
        total: targetStudents.length,
        skipped: skipped.length > 0 ? skipped : undefined,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-reminder] Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
