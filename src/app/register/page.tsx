"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!authLoading && user) router.replace(user.role === "ADMIN" ? "/admin" : "/products"); }, [authLoading, router, user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await register(name, email, password);
      router.replace("/products");
    } catch (caught) { setError(getErrorMessage(caught)); }
    finally { setLoading(false); }
  };

  return <div className="mx-auto max-w-md py-10"><div className="card p-6 sm:p-8">
    <div className="page-heading"><h1>Create account</h1><p>Register as a customer and start ordering.</p></div>
    <form onSubmit={submit} className="grid gap-4">
      {error && <div className="alert-error">{error}</div>}
      <div className="field"><label htmlFor="name">Name</label><input id="name" className="input" minLength={2} value={name} onChange={(event) => setName(event.target.value)} required /></div>
      <div className="field"><label htmlFor="register-email">Email</label><input id="register-email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
      <div className="field"><label htmlFor="register-password">Password</label><input id="register-password" type="password" className="input" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <div className="field"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" className="input" minLength={8} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
      <button className="button-primary mt-2" disabled={loading}>{loading ? "Creating account..." : "Register"}</button>
      <p className="text-center text-sm text-slate-600">Already registered? <Link href="/login" className="font-bold text-indigo-700">Login</Link></p>
    </form>
  </div></div>;
}
