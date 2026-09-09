"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <EmptyState icon="info" title="Something went wrong" action={<Button onClick={reset}>Try again</Button>}>ShopStack could not load this page. Please try again.</EmptyState>;
}
