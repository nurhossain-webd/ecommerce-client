"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    ...(user?.role === "USER" ? [{ href: "/orders", label: "My Orders" }] : []),
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Dashboard" }] : []),
  ];
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight text-indigo-700">ShopStack</Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {links.map((link) => <Link key={link.href} href={link.href} className={`nav-link ${link.href === "/" ? pathname === "/" ? "nav-link-active" : "" : pathname.startsWith(link.href) ? "nav-link-active" : ""}`}>{link.label}</Link>)}
          {!loading && (user ? <button onClick={logout} className="button-secondary ml-1">Logout</button> : <><Link href="/register" className="button-secondary ml-1">Register</Link><Link href="/login" className="button-primary ml-1">Login</Link></>)}
        </nav>
      </div>
      {user && <div className="border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-center text-xs text-slate-600">Signed in as <strong>{user.name}</strong> · {user.role}</div>}
    </header>
  );
}
