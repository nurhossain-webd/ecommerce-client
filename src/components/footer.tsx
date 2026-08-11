import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="page-shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <Link href="/" className="text-xl font-black tracking-tight text-white">ShopStack</Link>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">A secure full-stack marketplace powered by Next.js, Express, PostgreSQL, and Prisma.</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h2>
          <nav className="mt-3 grid gap-2 text-sm"><Link className="hover:text-white" href="/products">Products</Link><Link className="hover:text-white" href="/categories">Categories</Link><Link className="hover:text-white" href="/orders">My orders</Link></nav>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Account</h2>
          <nav className="mt-3 grid gap-2 text-sm"><Link className="hover:text-white" href="/login">Login</Link><Link className="hover:text-white" href="/register">Create account</Link></nav>
        </div>
      </div>
      <div className="border-t border-slate-800"><div className="page-shell flex flex-col justify-between gap-2 py-4 text-xs text-slate-500 sm:flex-row"><p>Copyright {new Date().getFullYear()} ShopStack. All rights reserved.</p><p>Secure orders and backend-verified prices.</p></div></div>
    </footer>
  );
}
