"use client";
import { StateCard } from "@/components/ui/state-card";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/lib/types";

export function ProtectedPage({ children, role }: { children: React.ReactNode; role?: UserRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else if (!loading && role && user?.role !== role) router.replace("/products");
  }, [loading, role, router, user]);
  if (loading || !user || (role && user.role !== role)) return <StateCard loading>Checking access…</StateCard>;
  return children;
}
