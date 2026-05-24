import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNotices } from "@/hooks/useData";
import { Bell } from "lucide-react";

export default function StudentNotices() {
  const { data: notices = [] } = useNotices();

  return (
    <DashboardLayout title="Notices">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-lg text-foreground">All Notices</h2>
        </div>
        {notices.map((n) => (
          <div key={n.id} className={`bg-card rounded-xl border p-5 shadow-card ${n.is_emergency ? "border-destructive/30" : "border-border"}`}>
            {n.is_emergency && (
              <span className="inline-block bg-destructive/15 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full mb-2">Emergency</span>
            )}
            <h3 className="font-display font-semibold text-foreground">{n.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
            <p className="text-xs text-muted-foreground mt-3">{n.created_by_name} • {n.date}</p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
