import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentStudent, useNotes } from "@/hooks/useData";
import LockCard from "@/components/LockCard";
import { FileText } from "lucide-react";

export default function StudentNotes() {
  const { data: student } = useCurrentStudent();
  const { data: notes = [] } = useNotes();

  const paidPct = student && student.total_fee > 0 ? Math.round((student.paid_amount / student.total_fee) * 100) : 0;
  const hasAccess = paidPct >= 50;

  if (!hasAccess) {
    return (
      <DashboardLayout title="Notes">
        <LockCard title="Notes" message="Access restricted. Pay at least 50% of fees to unlock notes." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notes">
      <div className="max-w-2xl mx-auto space-y-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{n.subject} • {n.class} • {n.created_by_name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
