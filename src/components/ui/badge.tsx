import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ tone = "brand", className, ...props }: ComponentProps<"span"> & { tone?: "brand" | "neutral" | "success" | "warning" }) {
  return <span className={cn("badge", `badge-${tone}`, className)} {...props} />;
}
