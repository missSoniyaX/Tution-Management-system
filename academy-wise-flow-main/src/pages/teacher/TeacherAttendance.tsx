import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudents, useAttendance, useSaveAttendance } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, CheckCircle, XCircle, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function TeacherAttendance() {
  const { user } = useAuth();
  const { data: students = [] } = useStudents();
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const { data: existingAttendance = [] } = useAttendance(dateStr);
  const saveAttendance = useSaveAttendance();

  const classes = useMemo<string[]>(() => {
    const typedStudents = students as Array<{ class: string }>;
    const set = new Set<string>(typedStudents.map((s) => s.class));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = selectedClass
    ? (students as Array<{ class: string }>).filter((s) => s.class === selectedClass)
    : (students as Array<any>);

  type AttendanceRecord = { status: "present" | "absent"; progress_note: string };
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});

  // Populate from existing attendance when data loads
  useEffect(() => {
    const map: Record<string, AttendanceRecord> = {};
    filteredStudents.forEach((s) => {
      const existing = existingAttendance.find((a: any) => a.student_id === s.id);
      map[s.id] = {
        status: existing ? (existing.status as "present" | "absent") : "present",
        progress_note: existing?.progress_note || "",
      };
    });
    setRecords(map);
  }, [existingAttendance, filteredStudents.length, selectedClass, dateStr]);

  const toggleStatus = (id: string) => {
    setRecords((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: prev[id]?.status === "present" ? "absent" : "present",
      },
    }));
  };

  const setNote = (id: string, note: string) => {
    setRecords((prev) => ({
      ...prev,
      [id]: { ...prev[id], progress_note: note },
    }));
  };

  const handleSave = async () => {
    if (filteredStudents.length === 0) {
      toast({ title: "No students", description: "Select a class first.", variant: "destructive" });
      return;
    }
    try {
      const payload = filteredStudents.map((s) => ({
        student_id: s.id,
        date: dateStr,
        status: records[s.id]?.status || "present",
        progress_note: records[s.id]?.progress_note || "",
      }));
      await saveAttendance.mutateAsync(payload);
      toast({ title: "Attendance Saved", description: `Saved for ${payload.length} students.` });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed to save attendance.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Attendance">
      <div className="max-w-3xl mx-auto">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">Select Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "w-full sm:w-[200px] px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring"
                )}>
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  {format(date, "dd MMM yyyy")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">Class</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">Progress Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const rec = records[s.id];
                  const isPresent = rec?.status === "present";
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleStatus(s.id)}
                          className={cn("p-1.5 rounded-lg transition-colors", isPresent ? "text-success hover:bg-success/10" : "text-destructive hover:bg-destructive/10")}>
                          {isPresent ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <input value={rec?.progress_note || ""} onChange={(e) => setNote(s.id, e.target.value)}
                          placeholder="Optional note..."
                          className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No students found. Select a class.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <button onClick={handleSave} disabled={saveAttendance.isPending || filteredStudents.length === 0}
          className="mt-6 w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saveAttendance.isPending ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </DashboardLayout>
  );
}
