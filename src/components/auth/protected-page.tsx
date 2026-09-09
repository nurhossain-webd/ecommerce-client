"use client";
import { StateCard } from "@/components/ui/state-card";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/types";
import { currentDestination, loginHref } from "@/lib/auth-redirect";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";

export function ProtectedPage({ children, role }: { children: React.ReactNode; role?: UserRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace(loginHref(currentDestination()));
  }, [loading, role, router, user]);
  if (loading || !user) return <StateCard loading>Checking access…</StateCard>;
  if (role && user.role !== role) return <EmptyState icon="shield" title="Access restricted" action={<ButtonLink href="/">Back to store</ButtonLink>}>Your account does not have permission to view this page.</EmptyState>;
  return children;
}
