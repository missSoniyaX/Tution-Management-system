import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentStudent } from "@/hooks/useData";
import LockCard from "@/components/LockCard";
import { BookOpen } from "lucide-react";

const syllabusData = [
  { subject: "Maths", completed: 15, total: 25, perWeek: 3 },
  { subject: "Science", completed: 10, total: 22, perWeek: 2 },
];

export default function StudentSyllabus() {
  const { data: student } = useCurrentStudent();

  const paidPct = student && student.total_fee > 0 ? Math.round((student.paid_amount / student.total_fee) * 100) : 0;
  const hasAccess = paidPct >= 50;

  if (!hasAccess) {
    return (
      <DashboardLayout title="Syllabus">
        <LockCard title="Syllabus Progress" message="Access restricted. Pay at least 50% of fees to unlock syllabus." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Syllabus Progress">
      <div className="max-w-2xl mx-auto space-y-4">
        {syllabusData.map((s) => {
          const pct = Math.round((s.completed / s.total) * 100);
          const remaining = s.total - s.completed;
          const weeksLeft = Math.ceil(remaining / s.perWeek);
          return (
            <div key={s.subject} className="bg-card rounded-xl border border-border p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-display font-semibold text-lg text-foreground">{s.subject}</h3>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 mb-3">
                <div className="gradient-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div><p className="text-muted-foreground">Progress</p><p className="font-bold text-foreground">{pct}%</p></div>
                <div><p className="text-muted-foreground">Remaining</p><p className="font-bold text-foreground">{remaining} ch.</p></div>
                <div><p className="text-muted-foreground">Est. Completion</p><p className="font-bold text-primary">{weeksLeft} weeks</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
