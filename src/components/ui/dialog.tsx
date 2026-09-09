"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "./icon";

export function Dialog({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("input, select, textarea, button, [href]")?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href]") ?? [])];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("keydown", handleKey); previouslyFocused?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="my-auto w-full max-w-xl rounded-2xl border border-line bg-white shadow-2xl"><header className="flex items-start justify-between gap-5 border-b border-line p-5 sm:p-6"><div><h2 id={titleId} className="text-xl font-semibold text-ink">{title}</h2>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div><Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-10 min-h-10" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></Button></header><div className="p-5 sm:p-6">{children}</div></section></div>;
}

export function ConfirmDialog({ open, title, children, busy, onCancel, onConfirm }: { open: boolean; title: string; children: ReactNode; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Dialog open={open} title={title} onClose={() => { if (!busy) onCancel(); }}><div className="text-sm leading-6 text-muted">{children}</div><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? "Deleting..." : "Delete"}</Button></div></Dialog>;
}
