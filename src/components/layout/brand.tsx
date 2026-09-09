import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Brand({ className, onClick }: { className?: string; onClick?: () => void }) {
  return <Link href="/" aria-label="ShopStack home" onClick={onClick} className={cn("inline-flex shrink-0 items-center gap-2 sm:gap-2.5 rounded-lg", className)}>
    <span className="grid size-8 place-items-center sm:size-10 rounded-xl bg-brand text-white shadow-sm">
      <svg width="25" height="25" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m5 9 9-5 9 5-9 5-9-5Z" fill="currentColor" /><path d="m5 14 9 5 9-5M5 19l9 5 9-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
    <span className="text-[20px] sm:text-[22px] font-bold tracking-[-0.045em] text-ink">Shop<span className="font-medium">Stack</span><span className="text-brand">.</span></span>
  </Link>;
}
