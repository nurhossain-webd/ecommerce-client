"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { PasswordField } from "@/components/auth/password-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { getDetailedErrorMessage as getErrorMessage } from "@/lib/api";
import { registerHref, safeNextPath } from "@/lib/auth-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestedDestination = safeNextPath(searchParams.get("next"), "");
  const sessionExpired = searchParams.get("reason") === "expired";

  useEffect(() => {
    if (!authLoading && user) router.replace(requestedDestination || (user.role === "ADMIN" ? "/admin" : "/products"));
  }, [authLoading, requestedDestination, router, user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login(normalizedEmail, password);
      router.replace(requestedDestination || (loggedInUser.role === "ADMIN" ? "/admin" : "/products"));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const createAccountHref = requestedDestination ? registerHref(requestedDestination) : "/register";
  return <div className="mx-auto max-w-md py-10"><Card className="p-6 sm:p-8">
    <div className="page-heading"><p className="eyebrow mb-3">ShopStack account</p><h1>Welcome back</h1><p>Sign in to continue shopping and view your orders.</p></div>
    <form onSubmit={submit} className="grid gap-4" aria-busy={loading} noValidate>
      {sessionExpired && !error && <Alert>Your session expired. Sign in again to continue.</Alert>}
      {error && <Alert>{error}</Alert>}
      <div className="field"><label htmlFor="email">Email</label><Input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} aria-invalid={Boolean(error)} /></div>
      <div className="field"><label htmlFor="password">Password</label><PasswordField id="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} aria-invalid={Boolean(error)} /></div>
      <Button type="submit" className="mt-2" disabled={loading || authLoading}>{loading ? "Signing in..." : "Sign in"}</Button>
      <p className="text-center text-sm text-muted">No account? <Link href={createAccountHref} className="font-semibold text-brand transition hover:text-brand-dark">Create one</Link></p>
    </form>
  </Card></div>;
}

export default function LoginPage() {
  return <Suspense fallback={<div className="mx-auto max-w-md py-10"><Skeleton className="h-[34rem] w-full" /></div>}><LoginForm /></Suspense>;
}
