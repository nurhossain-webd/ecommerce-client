"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

type Toast = { id: number; message: string; tone: "success" | "error" };
type ToastContextValue = { toast: (message: string, tone?: Toast["tone"]) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<number>());
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);
  const toast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = ++nextId.current;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    const timer = window.setTimeout(() => { timers.current.delete(timer); setToasts((current) => current.filter((item) => item.id !== id)); }, 4500);
    timers.current.add(timer);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2" aria-live="polite" aria-atomic="false">{toasts.map((item) => <div key={item.id} role="status" className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-xl ${item.tone === "success" ? "border-emerald-200 text-emerald-900" : "border-red-200 text-red-900"}`}><Icon name={item.tone === "success" ? "check" : "info"} className="mt-0.5 size-5 shrink-0" /><span className="min-w-0 flex-1 leading-5">{item.message}</span><button type="button" className="rounded p-1 text-current opacity-60 hover:opacity-100 focus-visible:outline-2" onClick={() => setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id))} aria-label="Dismiss notification"><Icon name="close" className="size-4" /></button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
