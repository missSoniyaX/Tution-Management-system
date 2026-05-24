import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTeachers } from "@/hooks/useData";
import { BookOpen, Clock } from "lucide-react";

export default function AdminTeachers() {
  const { data: teachers = [] } = useTeachers();

  return (
    <DashboardLayout title="Teachers">
      <div className="grid md:grid-cols-2 gap-4">
        {teachers.map((t) => {
          const pct = t.total_chapters > 0 ? Math.round((t.completed_chapters / t.total_chapters) * 100) : 0;
          const remaining = t.total_chapters - t.completed_chapters;
          const weeksLeft = t.chapters_per_week > 0 ? Math.ceil(remaining / t.chapters_per_week) : 0;
          return (
            <div key={t.id} className="bg-card rounded-xl border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.subject}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {t.assigned_classes.join(", ")}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 mb-3">
                <div className="gradient-primary h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5" /><span>Progress</span>
                  </div>
                  <p className="font-bold text-foreground">{pct}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-bold text-foreground">{remaining} ch.</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /><span>ETA</span>
                  </div>
                  <p className="font-bold text-primary">{t.predicted_completion_date || `${weeksLeft}w`}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
