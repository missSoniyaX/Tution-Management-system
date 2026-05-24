import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudents, useTeachers } from "@/hooks/useData";
import StatusBadge, { getStatus } from "@/components/StatusBadge";
import { Users, BookOpen, TrendingUp, IndianRupee } from "lucide-react";

export default function TeacherDashboard() {
  const { data: students = [] } = useStudents();
  const { data: teachers = [] } = useTeachers();
  const firstTeacher = teachers[0];

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="gradient-primary rounded-xl p-4 shadow-card text-primary-foreground">
          <Users className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-xs opacity-80">Students</p>
          <p className="font-display font-bold text-2xl">{students.length}</p>
        </div>
        <div className="gradient-success rounded-xl p-4 shadow-card text-primary-foreground">
          <BookOpen className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-xs opacity-80">Chapters Done</p>
          <p className="font-display font-bold text-2xl">{firstTeacher?.completed_chapters || 0}</p>
        </div>
        <div className="gradient-warning rounded-xl p-4 shadow-card text-primary-foreground">
          <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-xs opacity-80">Progress</p>
          <p className="font-display font-bold text-2xl">
            {firstTeacher ? Math.round((firstTeacher.completed_chapters / firstTeacher.total_chapters) * 100) : 0}%
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <IndianRupee className="w-5 h-5 mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Fee Collection</p>
          <p className="font-display font-bold text-2xl text-foreground">₹{students.reduce((a, s) => a + s.paid_amount, 0)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-foreground">Student List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Class</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Total Fee</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Paid</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const pct = s.total_fee > 0 ? Math.round((s.paid_amount / s.total_fee) * 100) : 0;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                    <td className="px-4 py-3 text-right text-foreground">₹{s.total_fee}</td>
                    <td className="px-4 py-3 text-right text-foreground">₹{s.paid_amount}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={getStatus(pct)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
