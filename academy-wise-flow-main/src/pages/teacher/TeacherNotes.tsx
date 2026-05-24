import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNotes, useCreateNote } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TeacherNotes() {
  const { data: notes = [] } = useNotes();
  const createNote = useCreateNote();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", subject: "", class: "" });

  const handleAdd = async () => {
    if (!form.title || !form.content) {
      toast({ title: "Error", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    try {
      await createNote.mutateAsync({ ...form, created_by_name: user?.name || "Teacher" });
      toast({ title: "Note Added" });
      setForm({ title: "", content: "", subject: "", class: "" });
      setShowForm(false);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to add note.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Notes">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-semibold text-lg text-foreground">Manage Notes</h2>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Note
          </button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">New Note</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject"
                  className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} placeholder="Class"
                  className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button onClick={handleAdd} disabled={createNote.isPending}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {createNote.isPending ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {notes.map((n) => (
            <div key={n.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{n.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{n.subject} • {n.class} • {n.created_by_name} • {n.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
