"use client";
import React, { useState } from 'react';
import { User, Lock, ArrowRight, Github, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FaGoogle } from "react-icons/fa";
interface LoginFormProps {
    onSubmit?: (email: string, password: string) => Promise<void> | void;
    onSocialLogin?: (provider: 'google' | 'facebook' | 'github' | 'apple' | 'twitter') => void;
}
declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function LoginForm({ onSubmit, onSocialLogin }: LoginFormProps) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // Wait for grecaptcha to be ready instead of checking window.grecaptcha directly
        const token = await new Promise<string>((resolve, reject) => {
            if (!window.grecaptcha) {
                return reject(new Error("reCAPTCHA not loaded"));
            }
            window.grecaptcha.ready(async () => {
                try {
                    const t = await window.grecaptcha.execute(
                        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
                        { action: "login" }
                    );
                    resolve(t);
                } catch (err) {
                    reject(err);
                }
            });
        });

        const verifyRes = await fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            throw new Error("Bot verification failed");
        }

        if (onSubmit) {
            await onSubmit(email, password);
        } else {
            const { authClient } = await import('@/lib/auth-client');
            const res = await authClient.signIn.email({ email, password });

            if (res.error) {
                throw new Error(res.error.message || "Invalid credentials");
            }

            window.location.href = "/";
        }

    } catch (error: any) {
        alert(error.message || 'Login failed');
    } finally {
        setIsLoading(false);
    }
};


    return (
        <div className="w-full max-w-md p-10 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-4xl font-extrabold text-white tracking-tight italic">
                    WELCOME<span className="text-[#d63031]"> BACK</span>
                </h2>
                <p className="mt-2 text-slate-400">Enter your credentials to access your account</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {/* Email Field */}
                    <div className="group relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="group relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
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
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => window.location.href = '/forgot-password'}
                        className="text-sm font-medium text-[#d63031] hover:text-red-400 transition-colors"
                    >
                        Forgot password?
                    </button>
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
                            Sign In
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

            {/* Compact Social Grid */}
            <div className="grid grid-cols-2 gap-4">
                <SocialButton
                    onClick={async () => {
                        if (onSocialLogin) {
                            onSocialLogin('google');
                        } else {
                            const { authClient } = await import('@/lib/auth-client');
                            await authClient.signIn.social({ provider: 'google' });
                        }
                    }}
                    icon={<FaGoogle size={20} />}
                />
                <SocialButton
                    onClick={async () => {
                        if (onSocialLogin) {
                            onSocialLogin('github');
                        } else {
                            const { authClient } = await import('@/lib/auth-client');
                            await authClient.signIn.social({ provider: 'github' });
                        }
                    }}
                    icon={<Github size={20} />}
                />

            </div>

            <p className="mt-8 text-center text-slate-400 text-sm">
                New here?{" "}
                <button onClick={() => window.location.href = '/signup'} className="text-white font-bold hover:text-[#d63031] transition-colors hover:underline">
                    Create an account
                </button>
            </p>
        </div>
    );
}

function SocialButton({ onClick, icon, isSvg = false }: { onClick: any, icon: any, isSvg?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-white group"
        >
            {isSvg ? (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    {icon}
                </svg>
            ) : (
                <div className="group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            )}
        </button>
    );
}