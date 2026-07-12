"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function login(e: React.FormEvent) {
    e.preventDefault();
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      localStorage.setItem("token", token);
      console.log(token);
      alert("Logged In!");
      router.push("/dashboard");
    } catch (e) {
      console.log(e);
      alert("Login Failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen mesh-bg selection:bg-primary-container selection:text-primary">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>
      
      <main className="relative z-10 w-full max-w-[460px] px-4 py-12">
        {/* Header/Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/10 mb-5 transition-all hover:scale-105 hover:shadow-primary/20 duration-500 ease-out">
            {/* Wallet icon as SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M21 7.28V5c0-1.1-.9-2-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-2.28A2 2 0 0 0 22 15V9a2 2 0 0 0-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"/>
              <circle cx="16" cy="12" r="1.5"/>
            </svg>
          </div>
          <h1 className="text-h2 text-on-background tracking-tight font-semibold">AssetFlow</h1>
          <p className="text-body-sm text-on-surface-variant mt-1.5 opacity-80">Enterprise Asset Management Suite</p>
        </div>

        {/* Login Card */}
        <section className="glass-card rounded-2xl p-8 md:p-11">
          <div className="mb-8">
            <h2 className="text-h3 text-on-background tracking-tight font-semibold">Sign in to your account</h2>
            <p className="text-body-sm text-on-surface-variant mt-2">Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={login} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-label-md text-on-surface-variant/90 ml-0.5 tracking-wide font-medium">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-[16px] text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary/50 focus:bg-white input-transition outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-0.5">
                <label htmlFor="password" className="text-label-md text-on-surface-variant/90 tracking-wide font-medium">
                  Password
                </label>
                <a href="#" className="text-label-sm text-primary font-semibold hover:text-primary/70 transition-colors focus:underline outline-none">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-3.5 bg-white/50 border border-slate-200 rounded-xl text-[16px] text-on-surface focus:ring-4 focus:ring-primary/5 focus:border-primary/50 focus:bg-white input-transition outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 rounded-xl text-label-md font-medium flex items-center justify-center gap-2 btn-glow transition-all hover:translate-y-[-1px] active:scale-[0.98] active:translate-y-0 mt-4 shadow-lg shadow-primary/20"
            >
              <span>Sign In</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-9">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/60"></div>
            </div>
            <div className="relative flex justify-center text-[11px] tracking-widest font-bold uppercase">
              <span className="bg-white/80 px-4 text-slate-400">new to assetflow</span>
            </div>
          </div>

          {/* Create Account Button */}
          <Link href="/signup" className="w-full bg-slate-50 text-slate-600 border border-slate-200 py-3.5 rounded-xl text-label-md font-medium flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-[0.98]">
            Create an account
          </Link>
        </section>

        {/* Footer Trust Elements */}
        <footer className="mt-10 text-center">
          <div className="flex items-center justify-center gap-5 text-slate-400 mb-5">
            <div className="flex items-center gap-1.5 cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-label-sm font-semibold">SAML SSO Support</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="flex items-center gap-1.5 cursor-default">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <span className="text-label-sm font-semibold">Bank-grade Security</span>
            </div>
          </div>
          <p className="text-label-sm text-slate-400/80">
            © 2024 AssetFlow Inc.
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-slate-600 hover:underline transition-colors">Privacy Policy</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-slate-600 hover:underline transition-colors">Terms</a>
          </p>
        </footer>
      </main>
    </div>
  );
}