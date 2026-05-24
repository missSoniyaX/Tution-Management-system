import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudents } from "@/hooks/useData";
import StatusBadge, { getStatus } from "@/components/StatusBadge";

export default function TeacherStudents() {
  const { data: students = [] } = useStudents();

  return (
    <DashboardLayout title="Students">
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Class</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Subjects</th>
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
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.subjects}</td>
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
