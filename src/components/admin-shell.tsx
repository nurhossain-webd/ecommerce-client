"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedPage } from "@/components/protected-page";

const links = [
  { href: "/admin", label: "Overview", icon: "01" },
  { href: "/admin/products", label: "Products", icon: "02" },
  { href: "/admin/categories", label: "Categories", icon: "03" },
  { href: "/admin/orders", label: "Orders", icon: "04" },
  { href: "/admin/users", label: "Users", icon: "05" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ProtectedPage role="ADMIN">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="bg-slate-950 p-5 text-white">
          <div className="border-b border-slate-800 pb-5">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">ShopStack</p>
            <h1 className="mt-2 text-xl font-black">Dashboard</h1>
          </div>
          <nav className="mt-5 flex gap-2 overflow-x-auto lg:grid">
            {links.map((link) => {
              const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
              return <Link key={link.href} href={link.href} className={`flex min-w-fit items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}><span className="text-xs opacity-70">{link.icon}</span>{link.label}</Link>;
            })}
          </nav>
          <Link href="/" className="mt-7 hidden border-t border-slate-800 pt-5 text-sm font-semibold text-slate-400 hover:text-white lg:block">&lt;- Return to store</Link>
        </aside>
        <section className="min-w-0 bg-slate-50 p-5 sm:p-7 lg:p-9">{children}</section>
      </div>
    </ProtectedPage>
  );
}
