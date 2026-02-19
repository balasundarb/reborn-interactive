"use client";
import React, { useState } from 'react';
import {
  User, Mail, Lock, ShieldCheck, ArrowRight,
  Github, Eye, EyeOff, Loader2
} from 'lucide-react';
import { FaGoogle } from "react-icons/fa";
interface SignupFormProps {
  onSignup?: (data: any) => Promise<void> | void;
  onSocialSignup?: (provider: string) => void;
}

export function SignupForm({ onSignup, onSocialSignup }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeToTerms: false
  });

  const isPasswordValid = formData.password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (onSignup) {
        await onSignup(formData);
      } else {
        // Default Better Auth sign up
        const { authClient } = await import('@/lib/auth-client');
        await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
        });
        window.location.href = '/'; // Redirect after signup
      }
    } catch (error: any) {
      alert(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-white tracking-tight italic">
          READY<span className="text-[#d63031]">?</span>
        </h2>
        <p className="mt-2 text-slate-400">Create your account to get started.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Full Name */}
          <div className="group relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
              required
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="group relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
              required
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password with Toggle */}
          <div className="group relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              className="w-full pl-10 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Dynamic Password Validation */}
        <div className={`flex items-center gap-2 text-xs transition-colors px-1 ${isPasswordValid ? 'text-emerald-400' : 'text-slate-500'}`}>
          <ShieldCheck size={14} className={isPasswordValid ? 'animate-pulse' : ''} />
          <span>At least 8 characters required</span>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#d63031] focus:ring-[#d63031]/50 focus:ring-offset-slate-900 transition-all"
            required
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
            I agree to the <a href="#" className="text-[#d63031] hover:underline">Terms</a>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full flex items-center justify-center py-4 bg-[#d63031] hover:bg-[#b02828] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/5"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0f172a] px-4 text-slate-500">Or continue with</span>
        </div>
      </div>

      {/* Social Options */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={async () => {
            if (onSocialSignup) {
              onSocialSignup('google');
            } else {
              const { authClient } = await import('@/lib/auth-client');
              await authClient.signIn.social({ provider: 'google' });
            }
          }}
          className="flex-1 flex justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-white group"
        >
          <FaGoogle size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          type="button"
          onClick={async () => {
            if (onSocialSignup) {
              onSocialSignup('github');
            } else {
              const { authClient } = await import('@/lib/auth-client');
              await authClient.signIn.social({ provider: 'github' });
            }
          }}
          className="flex-1 flex justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-white group"
        >
          <Github size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <p className="mt-8 text-center text-slate-400 text-sm">
        Already have an account?{" "}
        <button onClick={() => window.location.href = '/login'} className="text-white font-bold hover:text-[#d63031] transition-colors">
          Log in
        </button>
      </p>
    </div>
  );
}