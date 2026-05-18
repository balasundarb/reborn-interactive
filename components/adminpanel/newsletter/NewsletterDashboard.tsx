"use client";
import React, { useState, useTransition, useCallback, useEffect } from "react";
import {
  Send, Loader2, Mail, Users, RefreshCw,
  CheckCircle2, AlertTriangle, X, Sparkles,
  MailOpen, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/adminpanel/Header";
import { EmailEditor } from "./EmailEditor";
import { SubscribersList, Subscriber } from "./SubscribersList";

// ─── Email wrappers / templates ──────────────────────────────────────────────
const TEMPLATES: { label: string; html: string }[] = [
  {
    label: "Blank",
    html: `<p style="color:#fff;font-family:Arial,sans-serif;font-size:16px;">Hello,</p>
<p style="color:#94a3b8;font-family:Arial,sans-serif;font-size:16px;line-height:1.7;">Write your message here…</p>`,
  },
  {
    label: "Announcement",
    html: `<h1 style="color:#fff;font-family:Arial,sans-serif;font-size:28px;font-weight:800;margin:0 0 8px 0;">Big News 🎉</h1>
<hr style="border:none;border-top:2px solid #d63031;margin:16px 0;"/>
<p style="color:#94a3b8;font-family:Arial,sans-serif;font-size:16px;line-height:1.7;">We're excited to share something new with you. Here's what's happening…</p>
<p style="color:#94a3b8;font-family:Arial,sans-serif;font-size:16px;line-height:1.7;">Stay tuned for more updates!</p>
<br/>
<a href="#" style="display:inline-block;padding:14px 32px;background:#d63031;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;font-family:Arial,sans-serif;">Learn More →</a>`,
  },
  {
    label: "Update",
    html: `<h2 style="color:#fff;font-family:Arial,sans-serif;font-size:22px;font-weight:700;margin:0 0 12px 0;">Monthly Update</h2>
<p style="color:#94a3b8;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">Hi there,</p>
<p style="color:#94a3b8;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">Here's what happened this month at Reborn Interactive:</p>
<ul style="color:#94a3b8;font-family:Arial,sans-serif;font-size:15px;line-height:2;">
  <li>✅ Feature update 1</li>
  <li>✅ Feature update 2</li>
  <li>🚀 Coming soon: Something big</li>
</ul>
<br/>
<p style="color:#64748b;font-family:Arial,sans-serif;font-size:13px;">– The Reborn Interactive Team</p>`,
  },
  {
    label: "Promotion",
    html: `<div style="text-align:center;">
  <h1 style="color:#d63031;font-family:Arial,sans-serif;font-size:36px;font-weight:900;margin:0;">LIMITED OFFER</h1>
  <p style="color:#fff;font-family:Arial,sans-serif;font-size:18px;margin:12px 0;">Don't miss out on this exclusive deal</p>
  <p style="color:#94a3b8;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">For a limited time, enjoy exclusive access to our premium features. This offer ends soon — act now!</p>
  <br/>
  <a href="#" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#d63031,#b02828);color:#fff;text-decoration:none;font-weight:800;border-radius:12px;font-family:Arial,sans-serif;font-size:16px;box-shadow:0 8px 25px rgba(214,48,49,0.35);">Claim Offer →</a>
</div>`,
  },
];

function wrapInEmailShell(content: string, subject: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
        <tr><td style="background:linear-gradient(135deg,#d63031 0%,#b02828 100%);padding:32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">REBORN <em>INTERACTIVE</em></h1>
        </td></tr>
        <tr><td style="padding:40px 36px;">${content}</td></tr>
        <tr><td style="background:#0f172a;padding:24px;border-top:1px solid #334155;text-align:center;">
          <p style="margin:0;color:#64748b;font-size:12px;">© ${new Date().getFullYear()} Reborn Interactive. All rights reserved.</p>
          <p style="margin:6px 0 0;color:#64748b;font-size:11px;">You're receiving this because you subscribed to our newsletter.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Send Result Modal ────────────────────────────────────────────────────────
function ResultModal({ sent, failed, total, onClose }: { sent: number; failed: number; total: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
          <X size={16} />
        </button>
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-green-500/10 border border-green-500/20">
          <CheckCircle2 className="text-green-400" size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-white italic tracking-tight">
            EMAIL <span className="text-[#d63031]">SENT</span>
          </h3>
          <p className="text-slate-400 text-sm mt-2">Campaign delivered successfully</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: total, color: "text-white" },
            { label: "Sent", value: sent, color: "text-green-400" },
            { label: "Failed", value: failed, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 border border-white/8">
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-[#d63031] hover:bg-[#b02828] text-white rounded-xl font-bold transition-all active:scale-[0.98]">
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  initialSubscribers: Subscriber[];
}

export function NewsletterDashboard({ initialSubscribers }: Props) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState(TEMPLATES[0].html);
  const [sendToAll, setSendToAll] = useState(true);
  const [wrapEmail, setWrapEmail] = useState(true);
  const [isSending, startSend] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const refresh = useCallback(() => {
    startRefresh(async () => {
      try {
        const res = await fetch("/api/admin/newsletter/subscribers");
        const data = await res.json();
        if (res.ok) setSubscribers(data.subscribers ?? []);
      } catch {
        toast.error("Failed to refresh subscribers");
      }
    });
  }, []);

  const handleSend = () => {
    if (!subject.trim()) return toast.error("Subject line is required");
    if (!htmlContent.trim()) return toast.error("Email body cannot be empty");
    if (!sendToAll && selected.size === 0) return toast.error("Select at least one subscriber");

    const targetEmails = sendToAll
      ? []
      : subscribers.filter((s) => selected.has(s.id)).map((s) => s.email);

    const finalHtml = wrapEmail ? wrapInEmailShell(htmlContent, subject) : htmlContent;

    startSend(async () => {
      try {
        const res = await fetch("/api/admin/newsletter/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            htmlContent: finalHtml,
            sendToAll,
            targetEmails,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Send failed");
        setResult({ sent: data.sent, failed: data.failed, total: data.total });
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  };

  const recipientCount = sendToAll ? subscribers.length : selected.size;

  return (
    <div className="min-h-screen bg-[#060b14] mt-20">
      <Header />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight italic">
              NEWSLETTER <span className="text-[#d63031]">STUDIO</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Compose and send campaigns to your subscribers
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/70 border border-white/10 rounded-xl">
              <MailOpen size={15} className="text-[#d63031]" />
              <span className="text-white font-bold text-sm">{subscribers.length}</span>
              <span className="text-slate-500 text-sm">subscribers</span>
            </div>
          </div>
        </div>

        {/* Layout: Editor (left) + Subscribers (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* ── Left: Compose Panel ── */}
          <div className="space-y-4">
            {/* Subject */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Campaign Details</h2>

              <div className="group relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#d63031] transition-colors pointer-events-none" />
                <input
                  id="newsletter-subject"
                  type="text"
                  placeholder="Email subject line…"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#d63031]/40 focus:border-[#d63031]/40 transition-all text-sm font-medium"
                />
              </div>

              {/* Recipient toggle */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                  <button
                    onClick={() => setSendToAll(true)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      sendToAll ? "bg-[#d63031] text-white shadow-lg shadow-red-900/30" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Users size={13} /> All Subscribers
                  </button>
                  <button
                    onClick={() => setSendToAll(false)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      !sendToAll ? "bg-[#d63031] text-white shadow-lg shadow-red-900/30" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 size={13} /> Selected Only
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setWrapEmail((v) => !v)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${wrapEmail ? "bg-[#d63031]" : "bg-slate-700"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${wrapEmail ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-slate-400 text-xs">Email shell wrapper</span>
                </label>
              </div>

              {/* Recipient info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 rounded-lg">
                {recipientCount > 0
                  ? <CheckCircle2 size={13} className="text-green-400 shrink-0" />
                  : <AlertTriangle size={13} className="text-amber-400 shrink-0" />}
                <p className="text-xs text-slate-400">
                  {recipientCount > 0
                    ? `This campaign will be sent to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`
                    : "No recipients selected — pick from the subscriber list"}
                </p>
              </div>
            </div>

            {/* Templates picker */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
              <button
                onClick={() => setShowTemplates((v) => !v)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors mb-0"
              >
                <Sparkles size={13} className="text-[#d63031]" />
                Starter Templates
                <ChevronDown size={13} className={`transition-transform ${showTemplates ? "rotate-180" : ""}`} />
              </button>
              {showTemplates && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => { setHtmlContent(t.html); setShowTemplates(false); toast.success(`"${t.label}" template loaded`); }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:border-[#d63031]/40 hover:text-white hover:bg-[#d63031]/8 transition-all"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Editor */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">
                Email Body
              </p>
              <EmailEditor value={htmlContent} onChange={setHtmlContent} />
            </div>

            {/* Send button */}
            <button
              id="newsletter-send-btn"
              onClick={handleSend}
              disabled={isSending || recipientCount === 0}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#d63031] to-[#b02828] hover:from-[#b02828] hover:to-[#901f1f] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-extrabold text-base shadow-xl shadow-red-900/30 transition-all active:scale-[0.99] tracking-wide"
            >
              {isSending
                ? <><Loader2 className="animate-spin" size={20} /> Sending…</>
                : <><Send size={18} /> Send Campaign to {recipientCount} Recipient{recipientCount !== 1 ? "s" : ""}</>}
            </button>
          </div>

          {/* ── Right: Subscribers Panel ── */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[700px] xl:max-h-none xl:h-auto sticky top-24">
            <SubscribersList
              subscribers={subscribers}
              selected={selected}
              onSelectionChange={setSelected}
              onDeleted={(id) => setSubscribers((prev) => prev.filter((s) => s.id !== id))}
              onRefresh={refresh}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <ResultModal
          sent={result.sent}
          failed={result.failed}
          total={result.total}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  );
}
