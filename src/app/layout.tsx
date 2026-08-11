import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopStack",
  description: "E-commerce frontend connected to the Express and Prisma API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full"><AuthProvider><div className="flex min-h-screen flex-col"><Header /><main className="page-shell flex-1 py-8">{children}</main><Footer /></div></AuthProvider></body>
    </html>
  );
}
