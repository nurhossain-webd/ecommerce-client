"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/products", label: "Products", icon: "bag" },
  { href: "/admin/categories", label: "Categories", icon: "grid" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/users", label: "Users", icon: "user" },
  { href: "/admin/reviews", label: "Reviews", icon: "sparkles" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobileOpen]);

  const navigation = <><div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-indigo-300">ShopStack</p><p className="mt-1 text-lg font-semibold text-white">Admin console</p></div><Button variant="ghost" size="icon" className="size-9 min-h-9 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close admin navigation"><Icon name="close" /></Button></div><nav aria-label="Admin navigation" className="grid gap-1 p-3">{links.map((link) => { const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition", active ? "bg-brand text-white shadow-sm" : "text-slate-400 hover:bg-white/7 hover:text-white")}><Icon name={link.icon} className="size-[18px]" />{link.label}</Link>; })}</nav><div className="mt-auto border-t border-white/10 p-3"><Link href="/" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-400 hover:bg-white/7 hover:text-white"><Icon name="arrow" className="size-[18px] rotate-180" />Back to Store</Link></div></>;

  return <ProtectedPage role="ADMIN"><div className="min-h-[720px] overflow-hidden rounded-3xl border border-line bg-[#f5f6f9] shadow-[0_12px_45px_rgb(25_25_40/0.08)] lg:grid lg:grid-cols-[244px_minmax(0,1fr)]"><aside className="hidden bg-[#171821] lg:sticky lg:top-32 lg:flex lg:h-[calc(100vh-9rem)] lg:min-h-[640px] lg:flex-col">{navigation}</aside><div className="min-w-0"><div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden"><div><p className="text-xs font-semibold text-brand">ShopStack Admin</p><p className="text-sm text-muted">{links.find((link) => link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href))?.label}</p></div><Button variant="secondary" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open admin navigation"><Icon name="menu" /></Button></div><section className="min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10">{children}</section></div>{mobileOpen && <div className="fixed inset-0 z-[70] bg-slate-950/45 lg:hidden" onMouseDown={(event) => { if (event.currentTarget === event.target) setMobileOpen(false); }}><aside className="flex h-full w-[min(86vw,300px)] flex-col bg-[#171821] shadow-2xl">{navigation}</aside></div>}</div></ProtectedPage>;
}
