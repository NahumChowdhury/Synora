"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google authentication is not configured yet.");
      setLoading(false);
      return;
    }

    const start = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setError("Google did not return a valid sign-in credential.");
            return;
          }
          setError("");
          setLoading(true);
          try {
            const res = await apiFetch("/api/auth/google", {
              method: "POST",
              body: JSON.stringify({ credential: response.credential }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Authentication failed");
            const requestedNext = new URLSearchParams(window.location.search).get("next");
            const safeNext = requestedNext?.startsWith("/dashboard") ? requestedNext : "/dashboard";
            router.replace(safeNext);
          } catch (errorValue) {
            setError(errorValue instanceof Error ? errorValue.message : "Authentication failed. Please try again.");
          } finally {
            setLoading(false);
          }
        },
      });
      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 350,
        text: mode === "register" ? "signup_with" : "signin_with",
      });
      setLoading(false);
    };

    if (window.google) {
      start();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-synora-google="true"]');
    if (existing) {
      existing.addEventListener("load", start, { once: true });
      return () => existing.removeEventListener("load", start);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.synoraGoogle = "true";
    script.onload = start;
    script.onerror = () => {
      setError("Google authentication could not load. Check your connection and try again.");
      setLoading(false);
    };
    document.head.appendChild(script);
  }, [mode, router]);

  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
          {error}
        </div>
      )}
      <div className="flex justify-center min-h-11" ref={buttonRef} aria-label={mode === "register" ? "Register with Google" : "Login with Google"} />
      {loading && <p className="text-center text-xs text-slate-500">Loading secure Google authentication…</p>}
    </div>
  );
}
