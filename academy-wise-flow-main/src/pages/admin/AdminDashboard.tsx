import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudents, useSendReminder } from "@/hooks/useData";
import { useNotices } from "@/hooks/useData";
import StatusBadge, { getStatus } from "@/components/StatusBadge";
import { Users, GraduationCap, IndianRupee, Bell, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTeachers } from "@/hooks/useData";

export default function AdminDashboard() {
  const { data: students = [] } = useStudents();
  const { data: teachers = [] } = useTeachers();
  const { data: notices = [] } = useNotices();
  const sendReminder = useSendReminder();

  const totalStudents = students.length;
  const totalFees = students.reduce((a, s) => a + s.total_fee, 0);
  const totalPaid = students.reduce((a, s) => a + s.paid_amount, 0);
  const unpaidStudents = students.filter((s) => s.paid_amount < s.total_fee);

  const handleReminder = async () => {
    try {
      const result = await sendReminder.mutateAsync(undefined);
      const sent = result?.sent || 0;
      const failed = result?.failed || 0;
      let desc = `✅ ${sent} sent`;
      if (failed > 0) desc += `, ❌ ${failed} failed`;
      if (result?.skipped?.length) desc += `\nSkipped: ${result.skipped.join(", ")}`;
      toast({
        title: "Reminder Complete",
        description: desc,
      });
    } catch (err) {
      toast({
        title: "Reminder Failed",
        description: err instanceof Error ? err.message : "Could not send reminders. Check credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Students" value={String(totalStudents)} gradient="gradient-primary" />
        <StatCard icon={GraduationCap} label="Teachers" value={String(teachers.length)} gradient="gradient-success" />
        <StatCard icon={IndianRupee} label="Total Collected" value={`₹${totalPaid}`} gradient="gradient-warning" />
        <StatCard icon={TrendingUp} label="Pending Fees" value={`₹${totalFees - totalPaid}`} gradient="gradient-danger" />
      </div>

      {/* Reminder */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-lg text-foreground">Fee Reminders</h2>
            <p className="text-sm text-muted-foreground">{unpaidStudents.length} students have pending fees</p>
          </div>
          <button onClick={handleReminder} disabled={sendReminder.isPending}
            className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-card hover:shadow-card-hover transition-all whitespace-nowrap disabled:opacity-50">
            {sendReminder.isPending ? "Sending..." : "Send Fee Reminder"}
          </button>
        </div>

        {unpaidStudents.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="bg-secondary/50 rounded-lg p-4 text-sm">
              <p className="font-medium text-foreground mb-1">📧 English Message Preview:</p>
              <p className="text-muted-foreground">
                Dear Parent, Your child <strong>{unpaidStudents[0].name}</strong> joined on {unpaidStudents[0].joining_date}.
                Remaining fees ₹{unpaidStudents[0].total_fee - unpaidStudents[0].paid_amount}. Kindly pay before 28th February.
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-sm">
              <p className="font-medium text-foreground mb-1">📧 मराठी संदेश:</p>
              <p className="text-muted-foreground">
                आदरणीय पालक, आपल्या मुलाचे उर्वरित शुल्क ₹{unpaidStudents[0].total_fee - unpaidStudents[0].paid_amount} आहे.
                कृपया 28 फेब्रुवारी पूर्वी भरावे.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Notices */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">Recent Notices</h2>
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
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: any; label: string; value: string; gradient: string }) {
  return (
    <div className={`${gradient} rounded-xl p-4 shadow-card text-primary-foreground`}>
      <Icon className="w-5 h-5 mb-2 opacity-80" />
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-display font-bold text-2xl">{value}</p>
    </div>
  );
}
