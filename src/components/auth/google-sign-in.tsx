"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";

type GoogleCredentialResponse = { credential?: string };
type GoogleAccounts = { id: { initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void; renderButton: (element: HTMLElement, options: { theme: string; size: string; shape: string; width: number }) => void } };
declare global { interface Window { google?: { accounts: GoogleAccounts } } }

export function GoogleSignIn({ onCredential, disabled = false }: { onCredential: (credential: string) => Promise<void>; disabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const renderButton = useCallback(() => {
    if (!clientId || !containerRef.current || !window.google) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: (response) => {
      if (!response.credential || disabled) return;
      setError("");
      void onCredential(response.credential).catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Google sign-in failed."));
    } });
    window.google.accounts.id.renderButton(containerRef.current, { theme: "outline", size: "large", shape: "rectangular", width: Math.min(360, containerRef.current.clientWidth) });
  }, [clientId, disabled, onCredential]);
  if (!clientId) return <Alert>Google sign-in is unavailable until the Google client ID is configured.</Alert>;
  return <div className={disabled ? "pointer-events-none opacity-50" : ""} aria-disabled={disabled}>{error && <Alert className="mb-3">{error}</Alert>}<Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={renderButton} /><div ref={containerRef} className="flex min-h-11 justify-center" /></div>;
}
