import type { Metadata } from "next";
import LegalPageLayout, {
  type LegalSection,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Cookie Policy | Re-born Interactive",
  description:
    "Information about how Re-born Interactive uses cookies and similar browser storage technologies.",
};

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies?",
    content: (
      <p>
        Cookies and similar browser storage technologies (such as{" "}
        <code className="px-1.5 py-0.5 rounded bg-white/10 text-zinc-200 font-mono text-xs">
          localStorage
        </code>
        ) are small files stored on your device when you visit a website. They
        help keep you signed in, remember your preferences, protect forms from
        abuse, and measure site performance.
      </p>
    ),
  },
  {
    id: "types-of-cookies",
    title: "Categories of Cookies We Use",
    content: (
      <div className="space-y-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-1">
            1. Essential &amp; Authentication Cookies
          </h3>
          <p className="text-zinc-400 text-sm">
            Required for core site functionality, secure login sessions, CSRF
            protection, and locale routing. These cannot be disabled without
            affecting site operation.
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-1">
            2. Security &amp; Anti-Abuse Cookies
          </h3>
          <p className="text-zinc-400 text-sm">
            Set by Google reCAPTCHA to distinguish human visitors from automated
            bots on login and contact forms.
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-1">
            3. Preference &amp; UI Storage
          </h3>
          <p className="text-zinc-400 text-sm">
            Remembers your theme, language, and interface preferences across
            visits.
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
          <h3 className="font-semibold text-white mb-1">
            4. Analytics &amp; Performance
          </h3>
          <p className="text-zinc-400 text-sm">
            Helps us understand page load performance and aggregate visitor
            flows so we can continuously refine the experience.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "managing-cookies",
    title: "Managing Your Cookie Preferences",
    content: (
      <>
        <p>
          Most web browsers allow you to view, manage, block, or delete cookies
          through their privacy or security settings. Please note that blocking
          essential cookies may prevent authentication or certain interactive
          features from working properly.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    content: (
      <p>
        We may update this Cookie Policy as our technologies or legal
        requirements evolve. Any updates will appear on this page with an
        updated effective date.
      </p>
    ),
  },
];

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <LegalPageLayout
      locale={locale}
      active="cookies"
      badge="Cookie Notice"
      title="Cookie Policy"
      subtitle="Details on the essential, security, preference, and analytics technologies used across Re-born Interactive."
      lastUpdated="November 27, 2026"
      sections={sections}
    />
  );
}
