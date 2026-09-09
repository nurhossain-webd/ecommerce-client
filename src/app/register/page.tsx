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
import { loginHref, safeNextPath } from "@/lib/auth-redirect";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const requestedDestination = safeNextPath(searchParams.get("next"), "");

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
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    if (normalizedName.length < 2) return setError("Enter a name with at least 2 characters.");
    if (!normalizedEmail) return setError("Enter a valid email address.");
    if (password.length < 8 || password.length > 72) return setError("Password must be between 8 and 72 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const registeredUser = await register(normalizedName, normalizedEmail, password);
      router.replace(requestedDestination || (registeredUser.role === "ADMIN" ? "/admin" : "/products"));
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const signInHref = requestedDestination ? loginHref(requestedDestination) : "/login";
  return <div className="mx-auto max-w-md py-10"><Card className="p-6 sm:p-8">
    <div className="page-heading"><p className="eyebrow mb-3">Join ShopStack</p><h1>Create account</h1><p>Create your customer account to place and track orders.</p></div>
    <form onSubmit={submit} className="grid gap-4" aria-busy={loading} noValidate>
      {error && <Alert>{error}</Alert>}
      <div className="field"><label htmlFor="name">Name</label><Input id="name" autoComplete="name" minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} required disabled={loading} /></div>
      <div className="field"><label htmlFor="register-email">Email</label><Input id="register-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} /></div>
      <div className="field"><label htmlFor="register-password">Password</label><PasswordField id="register-password" autoComplete="new-password" minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} /></div>
      <div className="field"><label htmlFor="confirm-password">Confirm password</label><PasswordField id="confirm-password" autoComplete="new-password" minLength={8} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={loading} /></div>
      <Button type="submit" className="mt-2" disabled={loading || authLoading}>{loading ? "Creating account..." : "Create account"}</Button>
      <p className="text-center text-sm text-muted">Already registered? <Link href={signInHref} className="font-semibold text-brand transition hover:text-brand-dark">Sign in</Link></p>
    </form>
  </Card></div>;
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="mx-auto max-w-md py-10"><Skeleton className="h-[42rem] w-full" /></div>}><RegisterForm /></Suspense>;
}
