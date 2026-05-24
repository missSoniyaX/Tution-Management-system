import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, Bell, MessageSquare,
  BookOpen, LogOut, ChevronLeft, ChevronRight, Shield, FileUp, ClipboardCheck
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
  { label: "Notices", icon: Bell, path: "/admin/notices" },
  { label: "Feedback", icon: MessageSquare, path: "/admin/feedback" },
];

const teacherLinks = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/teacher" },
  { label: "Students", icon: Users, path: "/teacher/students" },
  { label: "Syllabus", icon: BookOpen, path: "/teacher/syllabus" },
  { label: "Notes", icon: BookOpen, path: "/teacher/notes" },
  { label: "Materials", icon: FileUp, path: "/teacher/materials" },
  { label: "Attendance", icon: ClipboardCheck, path: "/teacher/attendance" },
  { label: "Notices", icon: Bell, path: "/teacher/notices" },
];

const studentLinks = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/student" },
  { label: "Notes", icon: BookOpen, path: "/student/notes" },
  { label: "Materials", icon: FileUp, path: "/student/materials" },
  { label: "Attendance", icon: ClipboardCheck, path: "/student/attendance" },
  { label: "Syllabus", icon: BookOpen, path: "/student/syllabus" },
  { label: "Notices", icon: Bell, path: "/student/notices" },
  { label: "Feedback", icon: MessageSquare, path: "/student/feedback" },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === "admin" ? adminLinks : user?.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sidebar-primary-foreground text-lg truncate">
            E-Academy Pro
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
