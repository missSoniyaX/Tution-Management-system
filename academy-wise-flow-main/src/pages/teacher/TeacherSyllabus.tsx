import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTeachers, useUpdateTeacher } from "@/hooks/useData";
import { BookOpen, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TeacherSyllabus() {
  const { data: teachers = [] } = useTeachers();
  const updateTeacher = useUpdateTeacher();
  const [selectedId, setSelectedId] = useState(teachers[0]?.id || "");
  const [chapterInput, setChapterInput] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  const selected = teachers.find((t) => t.id === selectedId);

  // Update selectedId when teachers load
  if (teachers.length > 0 && !selectedId) {
    setSelectedId(teachers[0].id);
  }

  const handleMarkChapter = async () => {
    if (!selected || !chapterInput) return;
    await updateTeacher.mutateAsync({
      id: selectedId,
      updates: { completed_chapters: Math.min(selected.completed_chapters + 1, selected.total_chapters) },
    });
    toast({ title: "Chapter Recorded", description: `"${chapterInput}" marked as completed.` });
    setChapterInput("");
  };

  const handleSetCompletionDate = async () => {
    if (!selected || !completionDate) return;
    await updateTeacher.mutateAsync({
      id: selectedId,
      updates: { predicted_completion_date: completionDate },
    });
    toast({ title: "Completion Date Set", description: `Predicted completion: ${completionDate}` });
    setCompletionDate("");
  };

  if (!selected) return <DashboardLayout title="Syllabus Progress"><p className="text-muted-foreground">Loading...</p></DashboardLayout>;

  const pct = selected.total_chapters > 0 ? Math.round((selected.completed_chapters / selected.total_chapters) * 100) : 0;
  const remaining = selected.total_chapters - selected.completed_chapters;
  const weeksLeft = selected.chapters_per_week > 0 ? Math.ceil(remaining / selected.chapters_per_week) : 0;

  return (
    <DashboardLayout title="Syllabus Progress">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Select Subject</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.subject}</option>)}
          </select>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-foreground">{selected.subject}</h2>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 mb-4">
            <div className="gradient-primary h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div><p className="text-muted-foreground">Progress</p><p className="font-bold text-foreground text-lg">{pct}%</p></div>
            <div><p className="text-muted-foreground">Remaining</p><p className="font-bold text-foreground text-lg">{remaining} ch.</p></div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span>ETA</span></div>
              <p className="font-bold text-primary text-lg">{selected.predicted_completion_date || `${weeksLeft} weeks`}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-3">Record Today's Chapter</h3>
          <div className="flex gap-3">
            <input value={chapterInput} onChange={(e) => setChapterInput(e.target.value)} placeholder="e.g., Chapter 12 - Algebra"
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={handleMarkChapter} disabled={updateTeacher.isPending}
              className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm whitespace-nowrap disabled:opacity-50">
              Mark Done
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-display font-semibold text-foreground mb-3">Set Predicted Completion Date</h3>
          <div className="flex gap-3">
            <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={handleSetCompletionDate} disabled={updateTeacher.isPending}
              className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm whitespace-nowrap disabled:opacity-50">
              Save Date
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
