import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SiteChrome } from "@/components/layout/site-chrome";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/context/toast-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopStack",
  description: "Discover everyday favorites for your home, your routine, and whatever comes next. Shop the collection at ShopStack.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full"><a href="#main-content" className="skip-link">Skip to content</a><AuthProvider><ToastProvider><CartProvider><SiteChrome>{children}</SiteChrome></CartProvider></ToastProvider></AuthProvider></body>
    </html>
  );
}
