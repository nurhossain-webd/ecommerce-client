import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type StyleProps = { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "icon" };
function classes({ variant = "primary", size = "md" }: StyleProps) {
  return cn(`button-${variant}`, size === "sm" && "button-sm", size === "icon" && "button-icon");
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & StyleProps) {
  return <button type={type} className={cn(classes({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return <Link className={cn(classes({ variant, size }), className)} {...props} />;
}
