import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ArrowLeft, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const classOptions = ["5th", "6th", "7th", "8th", "9th", "10th"];
const subjectOptions = ["Science", "Maths", "Both"] as const;

function getFeeByClass(cls: string): number {
  const num = parseInt(cls);
  if (num >= 5 && num <= 7) return 2000;
  if (num >= 8 && num <= 9) return 4000;
  if (num === 10) return 5000;
  return 0;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Role is always student for public registration
  const selectedRole = "student" as const;

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    schoolName: "", class: "", subjects: "" as string,
    studentPhone: "", parentPhone: "", dob: "", joiningDate: "",
  });

  const estimatedFee = form.class ? getFeeByClass(form.class) : 0;
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!form.class || !form.subjects || !form.dob) {
      setError("Class, subjects, and date of birth are required");
      return;
    }

    setIsLoading(true);
    try {
      const err = await signup(form.email, form.password, selectedRole, form.name);
      if (err) {
        setError(err);
        setIsLoading(false);
        return;
      }

      // Create student record
      await new Promise((r) => setTimeout(r, 500));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: studentError } = await supabase.from("students").insert({
          user_id: user.id,
          name: form.name,
          school_name: form.schoolName,
          class: form.class,
          subjects: form.subjects as "Science" | "Maths" | "Both",
          student_phone: form.studentPhone,
          parent_phone: form.parentPhone,
          dob: form.dob,
          joining_date: form.joiningDate || new Date().toISOString().split("T")[0],
          total_fee: estimatedFee,
          paid_amount: 0,
        });
        if (studentError) {
          console.error("Student record error:", studentError);
        }
      }

      setIsLoading(false);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-2xl shadow-card border border-border p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full gradient-success flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">Registration Successful!</h2>
          <p className="text-muted-foreground text-sm mb-4">
            You have been registered as <strong className="capitalize">Student</strong>.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <h1 className="font-display font-bold text-2xl text-foreground mb-1">Register</h1>
        <p className="text-muted-foreground text-sm mb-6">Create your E-Academy Pro student account</p>

        <div className="bg-card rounded-2xl shadow-card border border-border p-6 space-y-4">
          {/* Role indicator */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
              <GraduationCap className="w-5 h-5" />
              Student Registration
            </div>
          </div>

          {/* Common fields */}
          <Field label="Full Name" value={form.name} onChange={(v) => update("name", v)} placeholder="Enter your name" />
          <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="Enter email" />
          <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="Min 6 characters" />
          <Field label="Confirm Password" type="password" value={form.confirmPassword} onChange={(v) => update("confirmPassword", v)} placeholder="Re-enter password" />

          {/* Student-specific fields */}
          <Field label="School Name" value={form.schoolName} onChange={(v) => update("schoolName", v)} placeholder="Enter school name" />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Class</label>
            <select
              value={form.class}
              onChange={(e) => update("class", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select class</option>
              {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Subjects</label>
            <div className="flex gap-2">
              {subjectOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => update("subjects", s)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.subjects === s
                      ? "gradient-primary text-primary-foreground border-transparent"
                      : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Field label="Student Phone" value={form.studentPhone} onChange={(v) => update("studentPhone", v)} placeholder="Phone number" type="tel" />
          <Field label="Parent Phone" value={form.parentPhone} onChange={(v) => update("parentPhone", v)} placeholder="Parent phone" type="tel" />
          <Field label="Date of Birth" value={form.dob} onChange={(v) => update("dob", v)} type="date" />
          <Field label="Joining Date" value={form.joiningDate} onChange={(v) => update("joiningDate", v)} type="date" />

          {form.class && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Estimated Annual Fee</p>
              <p className="font-display font-bold text-2xl text-primary">₹{estimatedFee}</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-card hover:shadow-card-hover transition-all disabled:opacity-50"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
    </div>
  );
}
