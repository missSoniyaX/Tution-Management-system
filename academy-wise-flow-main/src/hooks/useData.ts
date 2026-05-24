import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "jpg", "jpeg", "png", "webp"];
const QUERY_TIMEOUT_MS = 8000;

async function withQueryTimeout<T>(promise: PromiseLike<T>, label: string, timeoutMs = QUERY_TIMEOUT_MS): Promise<T> {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
  });

  try {
    return await Promise.race<T>([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

// Students
export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const { data, error } = await withQueryTimeout(
          supabase
            .from("students")
            .select("id,name,class,subjects,joining_date,total_fee,paid_amount,parent_phone,student_phone,user_id,dob,school_name")
            .order("name"),
          "students.select"
        );
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.error("[data] useStudents failed:", error);
        throw new Error(getErrorMessage(error, "Failed to load students."));
      }
    },
  });
}

export function useCurrentStudent() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["current-student", user?.id],
    enabled: !!user && user.role === "student",
    queryFn: async () => {
      try {
        const { data, error } = await withQueryTimeout(
          supabase.from("students").select("*").eq("user_id", user!.id).maybeSingle(),
          "currentStudent.select"
        );
        if (error) throw error;
        return data;
      } catch (error) {
        console.error("[data] useCurrentStudent failed:", error);
        throw new Error(getErrorMessage(error, "Failed to load student profile."));
      }
    },
  });
}

export function useUpdateStudentFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, paidAmount }: { id: string; paidAmount: number }) => {
      const { error } = await supabase.from("students").update({ paid_amount: paidAmount }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// Teachers
export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      try {
        const { data, error } = await withQueryTimeout(
          supabase
            .from("teachers")
            .select("id,name,subject,assigned_classes,completed_chapters,total_chapters,chapters_per_week,predicted_completion_date,user_id")
            .order("name"),
          "teachers.select"
        );
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.error("[data] useTeachers failed:", error);
        throw new Error(getErrorMessage(error, "Failed to load teachers."));
      }
    },
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("teachers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

// Notices
export function useNotices() {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      try {
        const { data, error } = await withQueryTimeout(
          supabase
            .from("notices")
            .select("id,title,description,is_emergency,date,created_by_name")
            .order("date", { ascending: false })
            .limit(50),
          "notices.select"
        );
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.error("[data] useNotices failed:", error);
        throw new Error(getErrorMessage(error, "Failed to load notices."));
      }
    },
  });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notice: { title: string; description: string; is_emergency: boolean; created_by_name: string }) => {
      const { error } = await supabase.from("notices").insert(notice);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
}

export function useUpdateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from("notices").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
}

// Notes
export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      try {
        const { data, error } = await withQueryTimeout(
          supabase
            .from("notes")
            .select("id,title,content,subject,class,created_by_name,date")
            .order("date", { ascending: false })
            .limit(50),
          "notes.select"
        );
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.error("[data] useNotes failed:", error);
        throw new Error(getErrorMessage(error, "Failed to load notes."));
      }
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { title: string; content: string; subject: string; class: string; created_by_name: string }) => {
      const { error } = await supabase.from("notes").insert(note);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

// Feedback
export function useFeedback() {
  return useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("id,student_name,teacher_name,subject,rating,comment,date,student_id").order("date", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fb: { student_name: string; teacher_name: string; subject: string; rating: number; comment: string; student_id?: string }) => {
      const { error } = await supabase.from("feedback").insert(fb);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

// Study Materials
export function useStudyMaterials() {
  return useQuery({
    queryKey: ["study-materials"],
    queryFn: async () => {
      try {
        const { data, error } = await withQueryTimeout(
          supabase
            .from("study_materials")
            .select("id,title,subject,class,file_name,file_url,file_type,uploaded_by_name,created_at")
            .order("created_at", { ascending: false }),
          "studyMaterials.select"
        );
        if (error) throw error;
        return data ?? [];
      } catch (error) {
        console.error("[data] useStudyMaterials failed:", error);
        throw new Error(getErrorMessage(error, "Failed to load study materials."));
      }
    },
  });
}

export function useUploadStudyMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title, subject, className, uploadedByName }: {
      file: File; title: string; subject: string; className: string; uploadedByName: string;
    }) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB");
      }

      // Validate file type
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        throw new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      }

      // Sanitize filename
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("study-materials")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("study-materials")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("study_materials").insert({
        title: title.trim().slice(0, 200),
        subject: subject.trim().slice(0, 100),
        class: className.trim().slice(0, 20),
        file_name: safeName,
        file_url: urlData.publicUrl,
        file_type: fileExt,
        uploaded_by_name: uploadedByName,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["study-materials"] }),
  });
}

// Attendance
export function useAttendance(date?: string, classFilter?: string) {
  return useQuery({
    queryKey: ["attendance", date, classFilter],
    enabled: !!date,
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("id,student_id,date,status,progress_note").eq("date", date!);
      if (error) throw error;
      return data;
    },
  });
}

export function useStudentAttendance() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-attendance", user?.id],
    enabled: !!user && user.role === "student",
    queryFn: async () => {
      const { data: student, error: sErr } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (sErr) throw sErr;
      if (!student) return [];
      
      const { data, error } = await supabase
        .from("attendance")
        .select("id,date,status,progress_note")
        .eq("student_id", student.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: { student_id: string; date: string; status: string; progress_note: string }[]) => {
      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "student_id,date" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// Send reminder
export function useSendReminder() {
  return useMutation({
    mutationFn: async (studentIds?: string[]) => {
      try {
        console.log("[send-reminder] Invoking edge function...");
        const { data, error } = await supabase.functions.invoke("send-reminder", {
          body: studentIds ? { studentIds } : {},
        });

        console.log("[send-reminder] Response:", { data, error: error?.message });

        if (error) {
          // Try to extract message from FunctionsHttpError context
          let msg = "Failed to send reminders.";
          try {
            if (error.context && typeof error.context.json === "function") {
              const body = await error.context.json();
              msg = body?.error || msg;
            } else if (error.message) {
              msg = error.message;
            }
          } catch {
            msg = error.message || msg;
          }
          throw new Error(msg);
        }

        return data;
      } catch (error) {
        console.error("[send-reminder] invoke failed:", error);
        if (error instanceof Error) throw error;
        throw new Error("Failed to send reminders.");
      }
    },
  });
}
