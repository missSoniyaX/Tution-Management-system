import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

export default function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-lg md:text-xl text-foreground truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground capitalize px-2 py-1 bg-secondary rounded-full">
              {user?.role}
            </span>
            <span className="text-sm font-medium text-foreground hidden sm:block">{user?.name}</span>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
