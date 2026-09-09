import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./icon";

export function Alert({ children, variant = "error", className }: { children: ReactNode; variant?: "error" | "success"; className?: string }) {
  return <div role={variant === "error" ? "alert" : "status"} className={cn(`alert-${variant}`, "flex items-start gap-3", className)}>
    <Icon name={variant === "success" ? "check" : "info"} className="mt-0.5 size-[18px] shrink-0" />
    <div className="min-w-0 flex-1">{children}</div>
  </div>;
}
