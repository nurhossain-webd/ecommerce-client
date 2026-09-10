"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authPage = pathname === "/login" || pathname === "/register";
  return <div className="flex min-h-screen flex-col">{!authPage && <Header />}<main id="main-content" tabIndex={-1} className="page-shell min-w-0 flex-1 py-8 outline-none sm:py-10 lg:py-12">{children}</main>{!authPage && <Footer />}</div>;
}
