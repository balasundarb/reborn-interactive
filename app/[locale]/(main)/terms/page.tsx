import type { Metadata } from "next";
import LegalPageLayout, {
  type LegalSection,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions | Re-born Interactive",
  description:
    "Terms and Conditions governing the use of Re-born Interactive websites, games, digital products, and services.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: (
      <>
        <p>
          Welcome to Re-born Interactive Co., Ltd. (&ldquo;Re-born Interactive,&rdquo;
          &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By accessing
          or using our website, games, interactive experiences, creator portals,
          or related services (collectively, the &ldquo;Services&rdquo;), you
          agree to be bound by these Terms &amp; Conditions.
        </p>
        <p>
          If you do not agree to these terms, please discontinue use of the
          Services immediately. You must be at least 13 years old (or the
          applicable age of digital consent in your jurisdiction) to use our
          Services.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property Rights",
    content: (
      <>
        <p>
          All content, trademarks, logos, game titles, 3D assets, artwork,
          audio, source code, and design elements displayed on or within the
          Services are the exclusive property of Re-born Interactive or its
          licensors and are protected by international copyright and trademark
          laws.
        </p>
        <p>
          You may not copy, modify, distribute, reverse-engineer, sell, or
          create derivative works from any portion of the Services without our
          prior written consent.
        </p>
      </>
    ),
  },
  {
    id: "accounts-conduct",
    title: "User Accounts & Acceptable Conduct",
    content: (
      <>
        <p>
          When creating an account or interacting with our Services, you agree
          to provide accurate information and safeguard your login credentials.
          You are responsible for all activity occurring under your account.
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>
            Do not attempt to bypass authentication, rate limits, or security
            controls.
          </li>
          <li>
            Do not upload malicious code, spam, or unlawful/infringing content.
          </li>
          <li>
            Do not harass, impersonate, or disrupt other users or creators.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "digital-services",
    title: "Games, Store & Digital Content",
    content: (
      <p>
        Any digital products, early-access builds, or promotional items offered
        through our Services are licensed, not sold, for personal,
        non-commercial entertainment unless explicitly stated otherwise. We
        reserve the right to update, modify, or discontinue features or titles
        at any time.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers & Limitation of Liability",
    content: (
      <>
        <p>
          The Services are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS
          AVAILABLE&rdquo; basis without warranties of any kind, express or
          implied, including fitness for a particular purpose or
          non-infringement.
        </p>
        <p>
          To the maximum extent permitted by law, Re-born Interactive shall not
          be liable for any indirect, incidental, special, consequential, or
          punitive damages arising out of your access to or use of the Services.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    content: (
      <p>
        We may revise these Terms &amp; Conditions from time to time. Updates
        will be posted on this page with an updated revision date. Continued use
        of the Services after changes take effect constitutes your acceptance of
        the revised terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Information",
    content: (
      <p>
        For questions regarding these Terms &amp; Conditions, please reach out
        through our{" "}
        <span className="text-white font-medium">Get In Touch</span> form on
        the website or contact{" "}
        <a
          href="mailto:info@reborninteractive.com"
          className="text-[#d63031] hover:underline"
        >
          info@reborninteractive.com
        </a>
        .
      </p>
    ),
  },
];

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <LegalPageLayout
      locale={locale}
      active="terms"
      badge="Legal Protocol"
      title="Terms & Conditions"
      subtitle="The rules, rights, and responsibilities that govern your access to Re-born Interactive games, platforms, and digital experiences."
      lastUpdated="November 27, 2026"
      sections={sections}
    />
  );
}
