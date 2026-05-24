import { cn } from "@/lib/utils";

type StatusType = "paid" | "unpaid" | "partial";

export default function StatusBadge({ status }: { status: StatusType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        status === "paid" && "bg-success/15 text-success",
        status === "unpaid" && "bg-destructive/15 text-destructive",
        status === "partial" && "bg-warning/15 text-warning"
      )}
    >
      {status === "paid" ? "Paid" : status === "unpaid" ? "Unpaid" : "Partial"}
    </span>
  );
}

export function getStatus(paidPercentage: number): StatusType {
  if (paidPercentage >= 100) return "paid";
  if (paidPercentage === 0) return "unpaid";
  return "partial";
}
