import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentStudent } from "@/hooks/useData";
import { useNotices, useNotes } from "@/hooks/useData";
import StatusBadge, { getStatus } from "@/components/StatusBadge";
import LockCard from "@/components/LockCard";
import { IndianRupee, TrendingUp, AlertTriangle, Bell, BookOpen, FileText } from "lucide-react";

export default function StudentDashboard() {
  const { data: student, isLoading } = useCurrentStudent();
  const { data: notices = [] } = useNotices();
  const { data: notes = [] } = useNotes();

  if (isLoading) return <DashboardLayout title="Student Dashboard"><p className="text-muted-foreground">Loading...</p></DashboardLayout>;
  if (!student) return <DashboardLayout title="Student Dashboard"><p className="text-muted-foreground">No student record found. Please contact admin.</p></DashboardLayout>;

  const paidPct = student.total_fee > 0 ? Math.round((student.paid_amount / student.total_fee) * 100) : 0;
  const hasAccess = paidPct >= 50;
  const remaining = student.total_fee - student.paid_amount;

  return (
    <DashboardLayout title="Student Dashboard">
      {!hasAccess && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive text-sm">Access Restricted</p>
            <p className="text-sm text-destructive/80">Notes and Syllabus available only after paying at least 50% of fees.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={IndianRupee} label="Total Fee" value={`₹${student.total_fee}`} gradient="gradient-primary" />
        <StatCard icon={TrendingUp} label="Paid" value={`${paidPct}%`} gradient="gradient-success" />
        <StatCard icon={IndianRupee} label="Remaining" value={`₹${remaining}`} gradient="gradient-warning" />
        <div className="bg-card rounded-xl border border-border p-4 shadow-card flex flex-col items-center justify-center">
          <span className="text-sm text-muted-foreground mb-1">Status</span>
          <StatusBadge status={getStatus(paidPct)} />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Name" value={student.name} />
          <Info label="Class" value={student.class} />
          <Info label="Subjects" value={student.subjects} />
          <Info label="DOB" value={new Date(student.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
          <Info label="Joining Date" value={new Date(student.joining_date).toLocaleDateString("en-IN")} />
          <Info label="School" value={student.school_name} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-foreground">Notices</h2>
          </div>
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className={`p-3 rounded-lg border ${n.is_emergency ? "border-destructive/30 bg-destructive/5" : "border-border bg-secondary/50"}`}>
                <p className="font-medium text-sm text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
              </div>
            ))}
          </div>
        </div>

        {hasAccess ? (
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg text-foreground">Notes</h2>
            </div>
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="p-3 rounded-lg border border-border bg-secondary/50">
                  <p className="font-medium text-sm text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.subject} • {n.created_by_name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <LockCard title="Notes" />
        )}

        {hasAccess ? (
          <div className="bg-card rounded-xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg text-foreground">Syllabus Progress</h2>
            </div>
            <div className="space-y-3">
              <ProgressItem label="Maths" completed={15} total={25} />
              <ProgressItem label="Science" completed={10} total={22} />
            </div>
          </div>
        ) : (
          <LockCard title="Syllabus Progress" />
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: string; gradient: string }) {
  return (
    <div className={`${gradient} rounded-xl p-4 shadow-card text-primary-foreground`}>
      <Icon className="w-5 h-5 mb-2 opacity-80" />
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-display font-bold text-xl">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function ProgressItem({ label, completed, total }: { label: string; completed: number; total: number }) {
  const pct = Math.round((completed / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{completed}/{total} chapters ({pct}%)</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div className="gradient-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
