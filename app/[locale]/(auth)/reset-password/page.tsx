'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authClient.resetPassword({ newPassword: password });
      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
          <a href="/forgot-password" className="text-[#d63031] hover:underline">
            Request a new one
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-white tracking-tight italic">
            RESET<span className="text-[#d63031]"> PASSWORD</span>
          </h2>
          <p className="mt-2 text-slate-400">Enter your new password</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full pl-10 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="group relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group w-full flex items-center justify-center py-4 bg-[#d63031] hover:bg-[#b02828] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                Reset Password
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}