"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Car, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router    = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode]           = useState<Mode>("login");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  // Form fields
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [plate, setPlate]         = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Basic validation
    if (!email || !password) return toast.error("Fill in all fields");
    if (mode === "signup" && !name)   return toast.error("Enter your name");
    if (password.length < 6)          return toast.error("Password must be 6+ characters");

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Welcome back! 👋");
      } else {
        await signUp(name, email, password);
        toast.success("Account created! 🎉");
      }
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const msg =
        code === "auth/user-not-found"   ? "No account found with this email." :
        code === "auth/wrong-password"    ? "Incorrect password." :
        code === "auth/email-already-in-use" ? "Email already in use." :
        code === "auth/invalid-email"     ? "Invalid email address." :
        code === "auth/weak-password"     ? "Password too weak." :
        "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex flex-col">

      {/* Top branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4">
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-4 shadow-xl">
          <span className="text-white font-black text-4xl">P</span>
        </div>
        <h1 className="text-3xl font-black text-white">Smart Parking</h1>
        <p className="text-blue-200 text-sm mt-1">Find. Book. Park. Simple.</p>

        {/* Stats row */}
        <div className="flex gap-6 mt-6">
          {[["100+", "Spots"], ["Mumbai", "City"], ["Live", "Updates"]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-white font-black text-lg leading-tight">{val}</p>
              <p className="text-blue-200 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-t-3xl shadow-2xl px-6 pt-7 pb-10">

        {/* Tab toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === m ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name (signup only) */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
              <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors">
                <User className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 text-sm font-medium outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
            <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors">
              <Mail className="w-5 h-5 text-gray-300 flex-shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 text-sm font-medium outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
            <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors">
              <Lock className="w-5 h-5 text-gray-300 flex-shrink-0" />
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 text-sm font-medium outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-300 hover:text-gray-500">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Vehicle plate (signup only) */}
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Vehicle Plate <span className="text-gray-300 font-normal normal-case">(optional)</span>
              </label>
              <div className="flex items-center gap-3 border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-blue-500 transition-colors">
                <Car className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="MH 01 AB 1234"
                  value={plate}
                  onChange={e => setPlate(e.target.value.toUpperCase())}
                  className="flex-1 text-sm font-medium outline-none text-gray-800 placeholder-gray-300 bg-transparent tracking-widest"
                />
              </div>
            </div>
          )}

          {/* Forgot password */}
          {mode === "login" && (
            <div className="text-right">
              <button type="button" className="text-xs text-blue-600 font-semibold hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-md disabled:opacity-60 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>

        {/* Switch mode */}
        <p className="text-center text-sm text-gray-400 mt-5">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-blue-600 font-bold hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        {/* Skip for now */}
        <button
          onClick={() => router.push("/")}
          className="w-full text-center text-xs text-gray-300 mt-4 hover:text-gray-400 transition-colors"
        >
          Skip for now → Browse as guest
        </button>

      </div>
    </div>
  );
}
