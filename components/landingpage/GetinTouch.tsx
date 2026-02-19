"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { X, ArrowRight, Sparkles } from "lucide-react";

interface GetInTouchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  description: string;
}

export function GetInTouch({ isOpen, onClose }: GetInTouchProps) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<keyof FormState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const ACCENT = "#d63031";

  const handleClose = useCallback(() => {
    setSubmitted(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handler);
      setTimeout(() => firstInputRef.current?.focus(), 400);
    }
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/getintouch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
      setForm({ name: '', email: '', description: '' }); // reset form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (id: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg flex flex-col
          bg-[#0a0a0a] border-l border-white/5 text-white shadow-[20px_0_50px_rgba(0,0,0,0.5)]
          transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Animated Accent Progress Line */}
        <div className="absolute top-0 left-0 h-[3px] w-full overflow-hidden bg-white/5">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{
              width: submitted ? '100%' : '30%',
              backgroundColor: ACCENT,
              boxShadow: `0 0 15px ${ACCENT}`
            }}
          />
        </div>

        {/* Header */}
        <div className="px-10 pt-16 pb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-neutral-500 font-bold">
              <span className="w-8 h-px bg-neutral-700" />
              Let's Connect
            </span>
            <button
              onClick={handleClose}
              aria-label="Close dialog"
              className="p-2 -mr-2 rounded-full hover:bg-white/5 transition-all active:scale-90"
            >
              <X size={20} className="text-neutral-400" />
            </button>
          </div>
          <h2 id="modal-title" className="text-5xl font-light tracking-tighter leading-none italic" style={{ fontFamily: 'serif' }}>
            Have a Cool Idea?<br />
            <span style={{ color: ACCENT }} className="not-italic font-black uppercase tracking-normal">Let's Collaborate</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-4 scrollbar-hide">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              {/* 1. ICON: Large scale-up with a bounce */}
              <div
                className="relative w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 rotate-12 
               animate-in zoom-in-50 slide-in-from-bottom-12 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  backgroundColor: `${ACCENT}15`,
                  border: `1px solid ${ACCENT}40`
                }}
              >
                {/* Inner Glow/Pulse Effect */}
                <div className="absolute inset-0 rounded-[2rem] animate-pulse bg-current opacity-5" style={{ color: ACCENT }} />

                <button
                  onClick={() => setSubmitted(false)}
                  className="relative hover:scale-110 transition-transform active:scale-95 group"
                  aria-label="Success"
                >
                  {/* Replace this div with your actual Checkmark SVG */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "green" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* 2. TITLE: Fade in with a slight delay */}
              <h3 className="text-3xl font-bold mb-3 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
                Message Received.
              </h3>

              {/* 3. SUBTEXT: Soft fade in with a longer delay */}
              <p className="text-neutral-500 text-base max-w-xs mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">
                Your ideas are in our inbox. We usually skip the fluff and respond within <span className="text-neutral-900 font-medium">24 hours</span>.
              </p>

              {/* 4. BUTTON: Subtle reveal from "nothing" */}
              <button
                onClick={() => setSubmitted(false)}
                className="group relative text-xs uppercase tracking-[0.2em] font-bold pb-2 
               animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both"
              >
                <span className="relative z-10">Go Back</span>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-neutral-200 group-hover:bg-black transition-colors" />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-black group-hover:w-full transition-all duration-500" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { id: "name", label: "Hey, I am", type: "text", placeholder: "Name" },
                { id: "email", label: "My email", type: "email", placeholder: "hello@gmail.com" },
                { id: "description", label: "Here's why I'm reaching out", type: "text", placeholder: "write what's on your mind..." }
              ].map((field) => (
                <div key={field.id} className="group relative">
                  <label
                    htmlFor={field.id}
                    className={`text-[10px] uppercase tracking-widest font-bold mb-2 block transition-colors ${focused === field.id ? 'text-white' : 'text-neutral-600'}`}
                  >
                    {field.label}
                  </label>



                  <input
                    id={field.id}
                    ref={field.id === "name" ? firstInputRef : null}
                    type={field.type}
                    required
                    value={form[field.id as keyof FormState]}
                    onChange={(e) => handleChange(field.id as keyof FormState, e.target.value)}
                    onFocus={() => setFocused(field.id as keyof FormState)}
                    onBlur={() => setFocused(null)}
                    placeholder={field.placeholder}
                    className="w-full bg-transparent border-b border-white/10 py-2 outline-none transition-all focus:border-white placeholder:text-neutral-800 text-lg"
                  />


                  {/* Focus Underline Accent */}
                  <div
                    className={`absolute bottom-0 left-0 h-px transition-all duration-500 ${focused === field.id ? 'w-full' : 'w-0'}`}
                    style={{ backgroundColor: ACCENT }}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-full py-5 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: ACCENT }}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? 'Sending...' : 'Submit'}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />}
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              {error && (
                <p className="text-xs text-red-400 text-center -mt-2">{error}</p>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 opacity-30 mt-auto">
          <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.4em]">
            <span>© 2026 REBORN INTERACTIVE</span>


          </div>
        </div>
      </aside>
    </>
  );
}