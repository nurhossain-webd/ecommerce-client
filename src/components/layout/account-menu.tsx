"use client";

import Link from "next/link";
import { useId } from "react";
import { useAuth } from "@/context/auth-context";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountMenu({ onOpen }: { onOpen?: () => void }) {
  const { user, loading, logout } = useAuth();
  const { open, setOpen, containerRef, triggerRef } = useDisclosure();
  const id = useId();
  if (loading) return <div role="status" aria-label="Loading account"><Skeleton className="size-10 sm:w-24" /></div>;
  if (!user) return <div className="hidden items-center gap-2 sm:flex"><ButtonLink href="/login" variant="ghost" className="px-2 sm:px-3">Log in</ButtonLink><ButtonLink href="/register" className="hidden sm:inline-flex">Register</ButtonLink></div>;

  return <div ref={containerRef} className="relative">
    <Button ref={triggerRef} variant="ghost" className="size-9 min-h-9 gap-2 p-0 sm:h-11 sm:w-auto sm:px-2.5" aria-label={`Account for ${user.name}`} aria-expanded={open} aria-controls={id} onClick={() => { if (!open) onOpen?.(); setOpen(!open); }}>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{user.name.trim().slice(0, 1).toUpperCase() || <Icon name="user" />}</span>
      <span className="hidden max-w-24 truncate lg:inline">{user.name.split(" ")[0]}</span>
      <Icon name="chevron" className={`hidden size-3.5 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
    </Button>
    {open && <div id={id} className="absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white p-2 shadow-[0_16px_48px_rgb(30_25_60/0.12)]">
      <div className="mb-2 border-b border-line px-3 pb-4 pt-3"><p className="text-sm font-semibold text-ink break-words">{user.name}</p><p className="mt-1 truncate text-xs text-muted">{user.email}</p></div>
      <nav aria-label="Account">{user.role === "USER" && <Link href="/orders" className="menu-link" onClick={() => setOpen(false)}><Icon name="orders" />My orders</Link>}{user.role === "ADMIN" && <Link href="/admin" className="menu-link" onClick={() => setOpen(false)}><Icon name="admin" />Dashboard</Link>}</nav>
      <div className="mt-2 border-t border-line pt-2"><button type="button" className="menu-link text-red-700" onClick={() => { setOpen(false); logout(); }}><Icon name="logout" />Log out</button></div>
    </div>}
  </div>;
}
