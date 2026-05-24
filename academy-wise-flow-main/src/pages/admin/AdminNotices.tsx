import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit2, Trash2, X, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminNotices() {
  const { data: notices = [] } = useNotices();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", is_emergency: false });

  const handleSave = async () => {
    if (!form.title) return;
    if (editId) {
      await updateNotice.mutateAsync({ id: editId, updates: form });
      toast({ title: "Notice Updated" });
    } else {
      await createNotice.mutateAsync({ ...form, created_by_name: user?.name || "Admin" });
      toast({ title: "Notice Created" });
    }
    setForm({ title: "", description: "", is_emergency: false });
    setShowForm(false);
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteNotice.mutateAsync(id);
    toast({ title: "Notice Deleted" });
  };

  return (
    <DashboardLayout title="Notices">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-semibold text-lg text-foreground">Manage Notices</h2>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", description: "", is_emergency: false }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> New Notice
          </button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">{editId ? "Edit" : "New"} Notice</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.is_emergency} onChange={(e) => setForm({ ...form, is_emergency: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-ring" />
                Send as Emergency Reminder
              </label>
              <button onClick={handleSave} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm">
                {editId ? "Update" : "Create"} Notice
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className={`bg-card rounded-xl border p-5 shadow-card ${n.is_emergency ? "border-destructive/30" : "border-border"}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {n.is_emergency && (
                    <span className="inline-block bg-destructive/15 text-destructive text-xs font-semibold px-2 py-0.5 rounded-full mb-2">Emergency</span>
                  )}
                  <h3 className="font-display font-semibold text-foreground">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{n.created_by_name} • {n.date}</p>
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => { setEditId(n.id); setForm({ title: n.title, description: n.description, is_emergency: n.is_emergency }); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
