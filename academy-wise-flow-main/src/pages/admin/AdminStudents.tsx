import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudents, useUpdateStudentFee } from "@/hooks/useData";
import StatusBadge, { getStatus } from "@/components/StatusBadge";
import { Search, Edit2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminStudents() {
  const { data: students = [] } = useStudents();
  const updateFee = useUpdateStudentFee();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editPaid, setEditPaid] = useState(0);

  const filtered = students
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => {
      const pct = Math.round((s.paid_amount / s.total_fee) * 100);
      if (filter === "paid") return pct >= 100;
      if (filter === "unpaid") return pct < 100;
      return true;
    });

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    try {
      await updateFee.mutateAsync({ id: editingStudent.id, paidAmount: editPaid });
      toast({ title: "Fee Updated", description: `${editingStudent.name}'s fee status updated.` });
      setEditingStudent(null);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to update fee.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="All Students">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2">
          {(["all", "paid", "unpaid"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
                filter === f ? "gradient-primary text-primary-foreground border-transparent" : "bg-card text-foreground border-border hover:border-primary/30"
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Class</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Subjects</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground hidden lg:table-cell">Joining</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Total</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">Paid</th>
                <th className="text-right px-4 py-3 font-semibold text-foreground hidden md:table-cell">Remaining</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const pct = s.total_fee > 0 ? Math.round((s.paid_amount / s.total_fee) * 100) : 0;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.subjects}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.joining_date}</td>
                    <td className="px-4 py-3 text-right text-foreground">₹{s.total_fee}</td>
                    <td className="px-4 py-3 text-right text-foreground">₹{s.paid_amount}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">₹{s.total_fee - s.paid_amount}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={getStatus(pct)} /></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => { setEditingStudent(s); setEditPaid(s.paid_amount); }}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-elevated p-6 w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-foreground">Edit Fee - {editingStudent.name}</h3>
              <button onClick={() => setEditingStudent(null)} className="p-1 rounded-lg hover:bg-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Fee</span>
                <span className="font-medium text-foreground">₹{editingStudent.total_fee}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Paid Amount (₹)</label>
                <input type="number" value={editPaid} onChange={(e) => setEditPaid(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button onClick={handleSaveEdit} disabled={updateFee.isPending}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {updateFee.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
