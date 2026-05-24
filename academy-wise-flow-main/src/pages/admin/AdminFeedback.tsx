import DashboardLayout from "@/components/layout/DashboardLayout";
import { useFeedback } from "@/hooks/useData";
import { Star, MessageSquare } from "lucide-react";

export default function AdminFeedback() {
  const { data: feedback = [] } = useFeedback();

  return (
    <DashboardLayout title="Student Feedback">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">All Feedback</h2>
        </div>
        {feedback.map((f) => (
          <div key={f.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{f.student_name}</p>
                <p className="text-sm text-muted-foreground">{f.teacher_name} • {f.subject}</p>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= f.rating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-foreground mt-3">{f.comment}</p>
            <p className="text-xs text-muted-foreground mt-2">{f.date}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
