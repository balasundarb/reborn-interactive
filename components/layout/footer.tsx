"use client";
import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { toast } from 'sonner';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Footer: React.FC = () => {
    const params = useParams<{ locale?: string }>();
    const locale = params?.locale || 'en';
    const [email, setEmail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim()) return;

        try {
            setIsSubmitting(true);

            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Subscription failed");
            }

            toast.success("Successfully joined the network.");
            setEmail("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const socialLinks: { icon: typeof FaTwitter; href: string; label: string }[] = [
        { icon: FaTwitter, href: 'https://x.com/RebornInte41311', label: 'Twitter' },
        { icon: FaGithub, href: 'https://github.com/reborninteractive36', label: 'GitHub' },
        { icon: FaLinkedin, href: 'https://www.linkedin.com/company/reborn-interactive-games/', label: 'LinkedIn' },
        { icon: FaInstagram, href: 'https://www.instagram.com/reborninteractive_/', label: 'Instagram' },
    ];

    const studioLinks = [
        { label: 'Home', href: `/${locale}` },
        { label: 'About', href: `/${locale}/about` },
        { label: 'Games', href: `/${locale}/games` },
        { label: 'Creators', href: `/${locale}/creators` },
        { label: 'News', href: `/${locale}/news` },
        { label: 'Store', href: `/${locale}/store` },
    ];

    const legalLinks = [
        { label: 'Privacy', href: `/${locale}/privacy` },
        { label: 'Terms', href: `/${locale}/terms` },
        { label: 'Cookies', href: `/${locale}/cookies` },
    ];

    return (
        <footer className="relative z-10 bg-[#030305] text-gray-300 overflow-hidden">
            {/* Top Crimson Hairline */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#d63031]/70 to-transparent" />

            {/* Subtle Background Grid & Ambient Glow */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,#000_65%,transparent_100%)] pointer-events-none" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[520px] rounded-full bg-[#d63031]/10 blur-[130px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-14 pb-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">
                    {/* Brand Identity */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="flex items-center gap-3.5 group">
                            <Link href={`/${locale}/login`} className="relative shrink-0">
                                <div className="absolute -inset-1 bg-[#d63031] rounded-full blur-[10px] opacity-30 group-hover:opacity-60 transition-opacity" />
                                <img
                                    src="/assets/navbar/Website.png"
                                    alt="Re-born Interactive"
                                    className="relative h-12 w-auto object-contain brightness-110 transition-transform duration-500 group-hover:scale-105"
                                />
                            </Link>
                            <h3 className="text-white font-black text-2xl tracking-tighter italic uppercase">
                                RE-BORN
                                <span className="inline-block text-[#d63031] drop-shadow-[0_0_8px_#d63031] animate-[blink_1.5s_ease-in-out_infinite]">
                                    .
                                </span>
                            </h3>
                        </div>

                        <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                            Architecting{' '}
                            <span className="text-[#d63031] font-medium drop-shadow-[0_0_5px_rgba(214,48,49,0.45)]">
                                digital emotions
                            </span>
                            . Redefining the boundaries of interactive neon entertainment.
                        </p>

                        <a
                            href="mailto:info@reborninteractive.com"
                            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-300 hover:text-white transition-colors group"
                        >
                            <Mail size={14} className="text-[#d63031] group-hover:scale-110 transition-transform" />
                            <span>info@reborninteractive.com</span>
                        </a>

                        {/* Social Icons */}
                        <div className="flex gap-3 pt-1">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="relative group w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-[#d63031]/70 hover:bg-[#d63031]/10 hover:shadow-[0_0_18px_rgba(214,48,49,0.35)] hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <Icon
                                            size={16}
                                            className="text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                                        />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Studio Links */}
                    <div className="lg:col-span-3 space-y-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#d63031]">
                            Explore
                        </p>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                            {studioLinks.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="group inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <span className="h-1 w-1 rounded-full bg-zinc-600 group-hover:bg-[#d63031] group-hover:scale-125 transition-all" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="md:col-span-2 lg:col-span-5">
                        <div className="relative rounded-2xl border border-white/10 border-l-4 border-l-[#d63031] bg-zinc-950/75 p-6 sm:p-7 backdrop-blur-md overflow-hidden group hover:border-white/15 transition-colors">
                            {/* Subtle corner accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#d63031]/10 [clip-path:polygon(100%_0,100%_100%,0_0)] transition-colors duration-500 group-hover:bg-[#d63031]/20 pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase italic text-white">
                                        STAY <span className="text-[#d63031]">SYNCED</span>
                                    </h2>
                                    <p className="mt-1 font-mono text-[11px] tracking-[0.22em] uppercase text-zinc-400">
                                        Join the collective. Never miss a transmission.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@domain.com"
                                        required
                                        className="grow rounded-xl bg-black/70 border border-white/15 py-3 px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 font-mono focus:border-[#d63031] focus:shadow-[0_0_16px_rgba(214,48,49,0.22)]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="relative shrink-0 bg-[#d63031] hover:bg-[#b92a2a] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#d63031]/25 hover:shadow-[#d63031]/45 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group/btn cursor-pointer"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                        <span className="relative">
                                            {isSubmitting ? 'Joining...' : 'Join'}
                                        </span>
                                        <Send
                                            size={14}
                                            className={`relative transition-transform duration-300 ${
                                                isSubmitting ? 'translate-x-1' : 'group-hover/btn:translate-x-0.5'
                                            }`}
                                        />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:pr-16">
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 text-center lg:text-left">
                        &copy; Re-born Interactive Co., Ltd. {new Date().getFullYear()}. All Rights Reserved.
                    </p>

                    <nav className="flex items-center gap-6 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-400">
                        {legalLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative hover:text-white transition-colors duration-300 group/link"
                            >
                                {item.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d63031] transition-all duration-300 group-hover/link:w-full" />
                            </Link>
                        ))}
                    </nav>

                    <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        Designed &amp; Developed by
                        <a
                            href="https://www.tagfinity.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                            TagFinity India
                        </a>
                    </p>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-0.5 w-full flex overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent to-[#d63031]" />
                <div className="h-full w-1/3 bg-[#d63031]" />
                <div className="h-full w-1/3 bg-gradient-to-l from-transparent to-[#d63031]" />
            </div>
        </footer>
    );
};

export default Footer;
