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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (id: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
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
            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in duration-500">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 rotate-12"
                style={{ backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}40` }}
              >
                <button onClick={() => setSubmitted(false)} aria-label="Success">
                    <Sparkles size={32} style={{ color: ACCENT }} />
                </button>
              </div>
              <h3 className="text-2xl font-bold mb-2">Received.</h3>
              <p className="text-neutral-500 text-sm max-w-xs mb-8">
                Your message is in our inbox. We respond to interesting ideas within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs uppercase tracking-widest font-bold border-b border-white/20 pb-1 hover:border-white transition-all"
              >
                Go Back
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
                className="group relative w-full overflow-hidden rounded-full py-5 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]"
                style={{ backgroundColor: ACCENT }}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                 Submit
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-10 opacity-30 mt-auto">
          <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.4em]">
            <span>© 2026 Studio</span>
            <div className="h-px w-12 bg-white" />
            <span>Privacy First</span>
          </div>
        </div>
      </aside>
    </>
  );
}