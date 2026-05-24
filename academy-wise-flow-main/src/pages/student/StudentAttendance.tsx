import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudentAttendance } from "@/hooks/useData";
import { CheckCircle, XCircle } from "lucide-react";

export default function StudentAttendance() {
  const { data: attendance = [], isLoading } = useStudentAttendance();

  const presentCount = attendance.filter((a: any) => a.status === "present").length;
  const totalCount = attendance.length;
  const pct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <DashboardLayout title="My Attendance">
      <div className="max-w-2xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Total Days</p>
            <p className="font-display font-bold text-2xl text-foreground">{totalCount}</p>
          </div>
          <div className="gradient-success rounded-xl p-4 shadow-card text-center text-primary-foreground">
            <p className="text-xs opacity-80">Present</p>
            <p className="font-display font-bold text-2xl">{presentCount}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
            <p className="text-xs text-muted-foreground">Attendance</p>
            <p className="font-display font-bold text-2xl text-foreground">{pct}%</p>
          </div>
        </div>

        {/* List */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No attendance records yet.</td></tr>
                ) : (
                  attendance.map((a: any) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.status === "present" ? (
                          <CheckCircle className="w-5 h-5 text-success inline" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive inline" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{a.progress_note || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
