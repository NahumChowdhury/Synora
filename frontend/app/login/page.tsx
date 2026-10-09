"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GoogleAuthButton from "../../components/GoogleAuthButton";

export default function LoginPage() {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setSessionExpired(new URLSearchParams(window.location.search).get("reason") === "session-expired");
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 mb-3">Daffodil International University</div>
          <h1 className="text-2xl font-bold tracking-tight">Login to Synora</h1>
          <p className="text-slate-500 text-sm mt-2">Use your official DIU Google account. Synora never receives your Google password.</p>
        </div>
        {sessionExpired && (
          <div role="status" className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-medium">
            Your Synora session expired. Login again to continue.
          </div>
        )}
        <GoogleAuthButton mode="login" />
        <p className="text-[11px] text-slate-500 text-center mt-6 leading-relaxed">Only a Google-verified <strong>@diu.edu.bd</strong> account is accepted.</p>
        <div className="mt-8 text-center text-xs text-slate-500">New to Synora? <Link href="/register" className="text-blue-600 hover:underline font-semibold">Register</Link></div>
      </div>
    </main>
  );
}
