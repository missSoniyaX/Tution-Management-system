import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentStudent, useStudyMaterials } from "@/hooks/useData";
import LockCard from "@/components/LockCard";
import { FileText, Download } from "lucide-react";

export default function StudentMaterials() {
  const { data: student } = useCurrentStudent();
  const { data: materials = [] } = useStudyMaterials();

  const paidPct = student && student.total_fee > 0 ? Math.round((student.paid_amount / student.total_fee) * 100) : 0;
  const hasAccess = paidPct >= 50;

  if (!hasAccess) {
    return (
      <DashboardLayout title="Study Materials">
        <LockCard title="Study Materials" message="Access restricted. Pay at least 50% of fees to unlock study materials." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Study Materials">
      <div className="max-w-2xl mx-auto space-y-4">
        {materials.map((m: any) => (
          <div key={m.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-foreground">{m.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.subject && `${m.subject} • `}{m.class && `${m.class} • `}{m.uploaded_by_name} • {m.file_type?.toUpperCase()}
                </p>
              </div>
              <a href={m.file_url} target="_blank" rel="noopener noreferrer" download
                className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors flex-shrink-0">
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
        ))}
        {materials.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No study materials available yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
}
