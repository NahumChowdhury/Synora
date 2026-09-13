"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your university email");
      return;
    }

    if (!normalizedEmail.endsWith("@diu.edu.bd")) {
      setError("Only @diu.edu.bd email addresses are accepted.");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok && data) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userId", data.userId.toString());
        localStorage.setItem("userRole", data.role);

        router.push("/dashboard");
      } else {
        setError(data?.message || "Invalid DIU email or password.");
      }
    } catch {
      setError("Unable to connect to the Synora server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 mb-3">
            Daffodil International University
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Synora Campus</h1>
          <p className="text-slate-500 text-xs mt-1">Login to your university student account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              DIU Student Email
            </label>
            <input
              type="email"
              placeholder="student@diu.edu.bd"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 text-sm transition"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">Must end with @diu.edu.bd</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 text-sm transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          Don't have a Synora account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-semibold">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}