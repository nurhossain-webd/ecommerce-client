"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!authLoading && user) router.replace(user.role === "ADMIN" ? "/admin" : "/products"); }, [authLoading, router, user]);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setLoading(true);
    try { const loggedInUser = await login(email, password); router.replace(loggedInUser.role === "ADMIN" ? "/admin" : "/products"); }
    catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  };
  return <div className="mx-auto max-w-md py-10"><div className="card p-6 sm:p-8">
    <div className="page-heading"><h1>Welcome back</h1><p>Log in with your backend account.</p></div>
    <form onSubmit={submit} className="grid gap-4">
      {error && <div className="alert-error">{error}</div>}
      <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <button className="button-primary mt-2" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      <p className="text-center text-sm text-slate-600">No account? <Link href="/register" className="font-bold text-indigo-700">Register</Link></p>
    </form>
  </div></div>;
}
