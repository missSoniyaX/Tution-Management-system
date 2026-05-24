import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTeachers, useCreateFeedback, useCurrentStudent } from "@/hooks/useData";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function StudentFeedback() {
  const { data: teachers = [] } = useTeachers();
  const { data: student } = useCurrentStudent();
  const createFeedback = useCreateFeedback();
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!teacher) {
      toast({ title: "Error", description: "Please select a teacher.", variant: "destructive" });
      return;
    }
    if (!rating) {
      toast({ title: "Error", description: "Please give a rating.", variant: "destructive" });
      return;
    }
    if (!subject) {
      toast({ title: "Error", description: "Please select a subject.", variant: "destructive" });
      return;
    }
    try {
      await createFeedback.mutateAsync({
        student_name: student?.name || "Student",
        teacher_name: teacher,
        subject,
        rating,
        comment,
        student_id: student?.id,
      });
      toast({ title: "Feedback Submitted!", description: "Thank you for your feedback." });
      setTeacher(""); setSubject(""); setRating(0); setComment("");
    } catch (err) {
      toast({ title: "Submission Failed", description: err instanceof Error ? err.message : "Could not submit feedback. Please try again.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Give Feedback">
      <div className="max-w-lg mx-auto">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-foreground">Submit Feedback</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Select Teacher</label>
            <select value={teacher} onChange={(e) => setTeacher(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Choose subject</option>
              {["Maths", "Science", "English", "General"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star className={`w-7 h-7 transition-colors ${n <= rating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Write your feedback..."
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={createFeedback.isPending}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
            {createFeedback.isPending ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
