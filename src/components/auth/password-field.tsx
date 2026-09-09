"use client";

import { useState, type ComponentProps } from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

export function PasswordField({ className, ...props }: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  return <div className="relative">
    <Input type={visible ? "text" : "password"} className={cn("pr-12", className)} {...props} />
    <button type="button" className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted outline-none transition hover:bg-surface hover:text-ink focus-visible:ring-2 focus-visible:ring-brand" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} disabled={props.disabled}>
      <Icon name={visible ? "eyeOff" : "eye"} className="size-5" />
    </button>
  </div>;
}
