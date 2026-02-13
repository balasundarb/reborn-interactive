'use client';

import { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
  await requestPasswordReset({ email, redirectTo: '/reset-password' });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
          <CheckCircle className="mx-auto mb-4 text-emerald-400" size={64} />
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-slate-400 mb-6">
            We've sent a password reset link to <strong className="text-white">{email}</strong>
          </p>
          <a 
            href="/login"
            className="inline-block text-[#d63031] hover:text-red-400 font-medium"
          >
            Back to Login
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
            FORGOT<span className="text-[#d63031]"> PASSWORD?</span>
          </h2>
          <p className="mt-2 text-slate-400">Enter your email to reset your password</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                Send Reset Link
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400 text-sm">
          Remember your password?{" "}
          <a href="/login" className="text-white font-bold hover:text-[#d63031] transition-colors">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}