"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { useAuth } from "@/context/auth-context";
import { useDisclosure } from "@/hooks/use-disclosure";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { Brand } from "./brand";
import { SearchField } from "./search-field";
import { AccountMenu } from "./account-menu";

type NavItem = { href: string; label: string; icon: IconName };

export function Header() {
  const pathname = usePathname();
  // Remount disclosures on route changes, including browser back/forward.
  return <StoreHeader key={pathname} pathname={pathname} />;
}

function StoreHeader({ pathname }: { pathname: string }) {
  const { user, loading, logout } = useAuth();
  const { open, setOpen, containerRef, triggerRef } = useDisclosure();
  const navigationId = useId();
  const links: NavItem[] = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/products", label: "Products", icon: "bag" },
    { href: "/categories", label: "Categories", icon: "grid" },
    ...(!loading && user?.role === "USER" ? [{ href: "/orders", label: "Orders", icon: "orders" as const }] : []),
    ...(!loading && user?.role === "ADMIN" ? [{ href: "/admin", label: "Dashboard", icon: "admin" as const }] : []),
  ];
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return <>
    <div className="bg-[#eeedf6] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-[#5e587d]">A little discovery. A new everyday favorite.</div>
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
      <div ref={containerRef}>
        <div className="page-shell flex min-h-20 flex-wrap items-center justify-between gap-x-2 gap-y-3 py-4 sm:gap-x-4 lg:flex-nowrap lg:gap-x-3 lg:py-4 xl:gap-x-5">
          <Brand onClick={() => setOpen(false)} />
          <nav aria-label="Main navigation" className="hidden shrink-0 items-center lg:flex">{links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={cn("nav-link px-2.5 xl:px-3", isActive(link.href) && "nav-link-active")}><Icon name={link.icon} className="hidden size-4 xl:block" />{link.label}</Link>)}</nav>
          <div className="order-3 w-full lg:order-none lg:min-w-40 lg:max-w-[320px] lg:flex-1"><SearchField onSearch={() => setOpen(false)} /></div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <AccountMenu key={user?.id ?? "guest"} onOpen={() => setOpen(false)} />
            <span className="mx-1 hidden h-7 w-px bg-line sm:block" />
            {user?.role !== "ADMIN" && <CartButton />}
            <Button ref={triggerRef} variant="ghost" size="icon" className="size-10 min-h-10 sm:size-11 lg:hidden" aria-expanded={open} aria-controls={navigationId} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} /></Button>
          </div>
        </div>
        {open && <div id={navigationId} className="absolute inset-x-0 top-full max-h-[calc(100dvh-11rem)] overflow-y-auto border-b border-line bg-white px-4 pb-5 pt-2 shadow-xl shadow-ink/5 lg:hidden">
          <nav aria-label="Mobile navigation" className="grid gap-1">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? "page" : undefined} className={cn("nav-link min-h-12", isActive(link.href) && "nav-link-active")}><Icon name={link.icon} className="size-[18px]" />{link.label}</Link>)}</nav>
          {!loading && <div className="mt-3 border-t border-line pt-4">{user ? <div className="flex items-center justify-between gap-4 px-2"><p className="min-w-0 truncate text-sm text-muted">Hello, <span className="font-medium text-ink">{user.name}</span></p><Button variant="ghost" onClick={() => { setOpen(false); logout(); }}><Icon name="logout" />Log out</Button></div> : <div className="grid grid-cols-2 gap-3"><ButtonLink href="/login" variant="secondary" onClick={() => setOpen(false)}>Log in</ButtonLink><ButtonLink href="/register" onClick={() => setOpen(false)}>Create account</ButtonLink></div>}</div>}
        </div>}
      </div>
    </header>
  </>;
}
