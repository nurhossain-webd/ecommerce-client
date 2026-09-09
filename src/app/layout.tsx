import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
      <body className="min-h-full"><a href="#main-content" className="skip-link">Skip to content</a><AuthProvider><div className="flex min-h-screen flex-col"><Header /><main id="main-content" tabIndex={-1} className="page-shell min-w-0 flex-1 py-8 outline-none sm:py-10 lg:py-12">{children}</main><Footer /></div></AuthProvider></body>
    </html>
  );
}
