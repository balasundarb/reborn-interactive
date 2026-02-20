"use client";
import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Instagram, Heart, Send } from 'lucide-react';
import { NextResponse } from 'next/server';
import { toast } from 'sonner';

const Footer: React.FC = () => {

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
  } catch (err: any) {
    toast.error(err.message || "Something went wrong.");
  } finally {
    setIsSubmitting(false);
  }
};

    const socialLinks: { icon: typeof Twitter; href: string; label: string }[] = [
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Instagram, href: '#', label: 'Instagram' },
    ];

    return (
        <footer className="relative z-10 bg-[#020202] text-gray-300 border-t border-[#d63031]/20 overflow-hidden">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none animate-[grid-flow_20s_linear_infinite]" />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#d63031] rounded-full opacity-30 animate-[float_${8 + i * 2}s_ease-in-out_infinite]"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${10 + i * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20">
                    {/* Brand Identity */}
                    <div className="lg:col-span-5 space-y-10">
                        <div className="space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                            <div className="flex items-center gap-4 group">
                                <div className="relative">
                                    {/* Pulsing Neon Ring */}
                                    <div className="absolute -inset-1 bg-[#d63031] rounded-full blur-[6px] opacity-40 animate-[pulse_2s_ease-in-out_infinite]"></div>
                                    <div className="absolute -inset-1 bg-[#d63031] rounded-full blur-[12px] opacity-20 animate-[pulse_2s_ease-in-out_infinite_0.5s]"></div>
                                    <img
                                        src="/favicon-384x384.png"
                                        alt="Re-born Interactive"
                                        className="relative h-14 w-14 object-contain brightness-110 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                                    />
                                </div>
                                <h3 className="text-white font-black text-3xl tracking-tighter italic uppercase cursor-default">
                                    RE-BORN
                                    <span className="inline-block text-[#d63031] drop-shadow-[0_0_8px_#d63031] animate-[blink_1.5s_ease-in-out_infinite]">
                                        .
                                    </span>
                                </h3>
                            </div>

                            <p className="text-lg text-gray-400 max-w-sm leading-relaxed font-light">
                                Architecting{' '}
                                <span className="text-[#d63031] font-medium drop-shadow-[0_0_5px_rgba(214,48,49,0.5)] transition-all duration-300 hover:drop-shadow-[0_0_10px_rgba(214,48,49,0.8)]">
                                    digital emotions
                                </span>
                                . Redefining the boundaries of interactive neon entertainment.
                            </p>
                        </div>

                        {/* Animated Social Icons */}
                        <div className="flex gap-4 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                            {socialLinks.map((social, i) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="relative group w-12 h-12 rounded-lg bg-black border border-[#d63031]/30 flex items-center justify-center transition-all duration-300 hover:border-[#d63031] hover:shadow-[0_0_15px_rgba(214,48,49,0.4)] hover:-translate-y-1 active:scale-95"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        {/* Hover Glow Effect */}
                                        <div className="absolute inset-0 rounded-lg bg-[#d63031]/0 group-hover:bg-[#d63031]/10 transition-all duration-300" />
                                        <Icon
                                            size={18}
                                            className="relative text-gray-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                                        />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Newsletter Section */}
                    <div className="lg:col-span-7 space-y-12 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
                        <div className="relative">
                            {/* Animated Glow */}
                            <div className="absolute inset-0 bg-[#d63031]/5 blur-3xl rounded-full pointer-events-none animate-[pulse_3s_ease-in-out_infinite]" />

                            <div className="relative border-l-4 border-[#d63031] bg-white/[0.02] p-8 md:p-10 backdrop-blur-sm overflow-hidden group hover:bg-white/[0.03] transition-all duration-500">
                                {/* Animated Corner */}
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#d63031]/10 [clip-path:polygon(100%_0,100%_100%,0_0)] transition-all duration-500 group-hover:bg-[#d63031]/20" />

                                {/* Scanning Line Effect */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d63031]/5 to-transparent h-full w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none" />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">
                                            Join the <span className="text-[#d63031]">Network</span>
                                        </h4>
                                    </div>

                                    <form onSubmit={handleSubmit} className="flex-grow max-w-md">
                                        <div className="relative flex items-center gap-2">
                                            <div className="relative flex-grow group/input">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    placeholder="youremail@gmail.com"
                                                    required
                                                    className="w-full bg-black/60 border py-4 px-5 text-sm text-white outline-none transition-all duration-300 placeholder:text-gray-600 font-mono border-[#d63031]/50 focus:border-[#d63031]/80 focus:shadow-[0_0_15px_rgba(214,48,49,0.2)] group-hover/input:border-white/20"
                                                />
                                                {/* Input Glow on Focus */}
                                                <div className="absolute inset-0 border border-[#d63031]/0 pointer-events-none transition-all duration-300 focus-within:border-[#d63031]/30" />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="relative bg-[#d63031] hover:bg-[#b92a2a] text-white px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#d63031]/20 hover:shadow-[#d63031]/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group/btn"
                                            >
                                                {/* Button Shine Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                                <span className="relative">
                                                    {isSubmitting ? 'Joining...' : 'Join'}
                                                </span>
                                                <Send
                                                    size={14}
                                                    className={`relative transition-transform duration-300 ${isSubmitting ? 'translate-x-1' : 'group-hover/btn:translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                               
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="text-[10px] uppercase md:tracking-[0.5em] text-white/50 ">
                            &copy;  Re-born Interactive Co., Ltd.{new Date().getFullYear()}. All Rights Reserved.
                        </p>
                        <p className="text-[10px] text-gray-600 flex items-center gap-1">
                            Crafted with{' '}
                            <Heart
                                size={10}
                                className="text-[#d63031] animate-[heartbeat_1.5s_ease-in-out_infinite]"
                            />{' '}
                            in Tamil Nadu, India
                        </p>
                    </div>

                    <nav className="flex gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        {['Privacy', 'Terms', 'Cookies'].map((item, i) => (
                            <a
                                key={item}
                                href="#"
                                className="relative hover:text-white transition-colors duration-300 group/link"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#d63031] transition-all duration-300 group-hover/link:w-full" />
                            </a>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Animated Accent Line */}
            <div className="h-1 w-full flex overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-transparent to-[#d63031] animate-[slideInLeft_1s_ease-out]" />
                <div className="h-full w-1/3 bg-[#d63031] animate-[pulse_2s_ease-in-out_infinite]" />
                <div className="h-full w-1/3 bg-gradient-to-l from-transparent to-[#d63031] animate-[slideInRight_1s_ease-out]" />
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes blink {
                    0%,
                    100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }

                @keyframes scan {
                    0% {
                        transform: translateY(-100%);
                    }
                    100% {
                        transform: translateY(100%);
                    }
                }

                @keyframes float {
                    0%,
                    100% {
                        transform: translateY(0) translateX(0);
                    }
                    33% {
                        transform: translateY(-20px) translateX(10px);
                    }
                    66% {
                        transform: translateY(-10px) translateX(-10px);
                    }
                }

                @keyframes heartbeat {
                    0%,
                    100% {
                        transform: scale(1);
                    }
                    25% {
                        transform: scale(1.2);
                    }
                    50% {
                        transform: scale(1);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                @keyframes grid-flow {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(40px, 40px);
                    }
                }
            `}</style>
        </footer>
    );
};

export default Footer;