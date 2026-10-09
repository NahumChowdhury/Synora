"use client";

import Link from "next/link";
import GoogleAuthButton from "../../components/GoogleAuthButton";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-100 mb-3">DIU Students Only</div>
          <h1 className="text-2xl font-bold tracking-tight">Register for Synora</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">Register using your official DIU Google account. No separate Synora password is created.</p>
        </div>
        <GoogleAuthButton mode="register" />
        <p className="text-[11px] text-slate-500 text-center mt-6 leading-relaxed">Google must verify that the account belongs to <strong>@diu.edu.bd</strong>.</p>
        <div className="mt-8 text-center text-xs text-slate-500">Already registered? <Link href="/login" className="text-blue-600 hover:underline font-semibold">Login</Link></div>
      </div>
    </main>
  );
}
