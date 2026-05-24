import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, Bell, MessageSquare, GraduationCap, FileUp, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Home", icon: LayoutDashboard, path: "/admin" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
  { label: "Notices", icon: Bell, path: "/admin/notices" },
  { label: "Feedback", icon: MessageSquare, path: "/admin/feedback" },
];

const teacherLinks = [
  { label: "Home", icon: LayoutDashboard, path: "/teacher" },
  { label: "Students", icon: Users, path: "/teacher/students" },
  { label: "Materials", icon: FileUp, path: "/teacher/materials" },
  { label: "Attend.", icon: ClipboardCheck, path: "/teacher/attendance" },
  { label: "Notices", icon: Bell, path: "/teacher/notices" },
];

const studentLinks = [
  { label: "Home", icon: LayoutDashboard, path: "/student" },
  { label: "Notes", icon: BookOpen, path: "/student/notes" },
  { label: "Attend.", icon: ClipboardCheck, path: "/student/attendance" },
  { label: "Notices", icon: Bell, path: "/student/notices" },
  { label: "Feedback", icon: MessageSquare, path: "/student/feedback" },
];

export default function BottomNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = user?.role === "admin" ? adminLinks : user?.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated">
      <div className="flex justify-around items-center py-2 px-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors min-w-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate">{link.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
