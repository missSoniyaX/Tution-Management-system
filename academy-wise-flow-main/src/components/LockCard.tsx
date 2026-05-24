import { Lock } from "lucide-react";

export default function LockCard({ title, message }: { title: string; message?: string }) {
  return (
    <div className="relative bg-card rounded-xl border border-border p-6 shadow-card opacity-75">
      <div className="absolute inset-0 bg-muted/50 rounded-xl flex flex-col items-center justify-center backdrop-blur-sm z-10">
        <Lock className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground text-center px-4">
          {message || "Pay at least 50% of fees to unlock"}
        </p>
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}
