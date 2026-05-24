import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentNotices from "./pages/student/StudentNotices";
import StudentNotes from "./pages/student/StudentNotes";
import StudentSyllabus from "./pages/student/StudentSyllabus";
import StudentFeedback from "./pages/student/StudentFeedback";
import StudentMaterials from "./pages/student/StudentMaterials";
import StudentAttendance from "./pages/student/StudentAttendance";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherSyllabus from "./pages/teacher/TeacherSyllabus";
import TeacherNotes from "./pages/teacher/TeacherNotes";
import TeacherNotices from "./pages/teacher/TeacherNotices";
import TeacherMaterials from "./pages/teacher/TeacherMaterials";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminFeedback from "./pages/admin/AdminFeedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} replace /> : <RegisterPage />} />

      <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/notices" element={<ProtectedRoute role="student"><StudentNotices /></ProtectedRoute>} />
      <Route path="/student/notes" element={<ProtectedRoute role="student"><StudentNotes /></ProtectedRoute>} />
      <Route path="/student/syllabus" element={<ProtectedRoute role="student"><StudentSyllabus /></ProtectedRoute>} />
      <Route path="/student/feedback" element={<ProtectedRoute role="student"><StudentFeedback /></ProtectedRoute>} />
      <Route path="/student/materials" element={<ProtectedRoute role="student"><StudentMaterials /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute role="student"><StudentAttendance /></ProtectedRoute>} />

      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><TeacherStudents /></ProtectedRoute>} />
      <Route path="/teacher/syllabus" element={<ProtectedRoute role="teacher"><TeacherSyllabus /></ProtectedRoute>} />
      <Route path="/teacher/notes" element={<ProtectedRoute role="teacher"><TeacherNotes /></ProtectedRoute>} />
      <Route path="/teacher/notices" element={<ProtectedRoute role="teacher"><TeacherNotices /></ProtectedRoute>} />
      <Route path="/teacher/materials" element={<ProtectedRoute role="teacher"><TeacherMaterials /></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute role="admin"><AdminStudents /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><AdminTeachers /></ProtectedRoute>} />
      <Route path="/admin/notices" element={<ProtectedRoute role="admin"><AdminNotices /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute role="admin"><AdminFeedback /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  // Global unhandled rejection handler
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection:", event.reason);
      // Don't show toast for auth refresh errors (expected when session expires)
      const msg = event.reason?.message || String(event.reason);
      if (msg.includes("Refresh Token") || msg.includes("refresh_token")) {
        event.preventDefault();
        return;
      }
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => window.removeEventListener("unhandledrejection", handleRejection);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
