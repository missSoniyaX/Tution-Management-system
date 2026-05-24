import { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useStudyMaterials, useUploadStudyMaterial } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText, Download, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ACCEPTED_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp";

export default function TeacherMaterials() {
  const { user } = useAuth();
  const { data: materials = [] } = useStudyMaterials();
  const uploadMaterial = useUploadStudyMaterial();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file || !title) {
      toast({ title: "Error", description: "Title and file are required.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 5MB.", variant: "destructive" });
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["pdf", "doc", "docx", "ppt", "pptx", "jpg", "jpeg", "png", "webp"].includes(ext)) {
      toast({ title: "Error", description: "Invalid file type. Allowed: PDF, DOCX, PPT, JPG, PNG.", variant: "destructive" });
      return;
    }
    try {
      await uploadMaterial.mutateAsync({
        file,
        title,
        subject,
        className,
        uploadedByName: user?.name || "Teacher",
      });
      toast({ title: "Material Uploaded", description: `${file.name} uploaded successfully.` });
      setTitle(""); setSubject(""); setClassName(""); setFile(null); setShowForm(false);
    } catch (err) {
      toast({ title: "Upload Failed", description: err instanceof Error ? err.message : "Failed to upload.", variant: "destructive" });
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-primary" />;
  };

  return (
    <DashboardLayout title="Study Materials">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-semibold text-lg text-foreground">Study Materials</h2>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Upload Material</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <div className="grid grid-cols-2 gap-3">
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject"
                  className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class"
                  className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                {file && <p className="text-xs text-muted-foreground mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
              </div>
              <button onClick={handleUpload} disabled={uploadMaterial.isPending}
                className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                {uploadMaterial.isPending ? "Uploading..." : "Upload Material"}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {materials.map((m: any) => (
            <div key={m.id} className="bg-card rounded-xl border border-border p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(m.file_type)}
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
            <p className="text-center text-muted-foreground py-8">No materials uploaded yet.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
