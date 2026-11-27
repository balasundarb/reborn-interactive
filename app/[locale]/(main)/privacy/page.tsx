import type { Metadata } from "next";
import LegalPageLayout, {
  type LegalSection,
} from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Re-born Interactive",
  description:
    "How Re-born Interactive collects, uses, protects, and respects your personal data.",
};

const sections: LegalSection[] = [
  {
    id: "information-collected",
    title: "Information We Collect",
    content: (
      <>
        <p>
          We collect only the information necessary to operate, secure, and
          improve Re-born Interactive&apos;s Services:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
          <li>
            <strong className="text-white">Account Information:</strong> Name,
            email address, and authentication identifiers when you sign up or
            sign in (including via Google or GitHub OAuth).
          </li>
          <li>
            <strong className="text-white">Communications:</strong> Email
            addresses submitted to our newsletter and messages sent via our
            contact form.
          </li>
          <li>
            <strong className="text-white">Usage &amp; Telemetry:</strong>{" "}
            Aggregated page views, device/browser type, approximate region, and
            referrer metadata to understand site performance.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: (
      <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
        <li>Authenticate users and maintain secure account sessions.</li>
        <li>
          Deliver studio news, game updates, and responses to your inquiries.
        </li>
        <li>
          Protect our platform from bots, spam, and unauthorized access (such
          as via Google reCAPTCHA).
        </li>
        <li>Analyze aggregate traffic trends to improve user experience.</li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Services",
    content: (
      <p>
        We rely on trusted infrastructure providers to deliver our Services,
        including cloud database hosting, transactional email delivery
        (Resend), OAuth authentication providers (Google, GitHub), and bot
        protection (Google reCAPTCHA). Each provider processes data strictly in
        accordance with their respective privacy commitments and only as needed
        to perform their service.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "Data Retention & Security",
    content: (
      <p>
        We retain personal information only for as long as necessary to fulfill
        the purposes described in this policy or as required by law. We
        implement industry-standard encryption in transit (HTTPS/TLS),
        role-based access controls, and secure session management to protect
        your data.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    content: (
      <>
        <p>
          Depending on your location, you may have the right to request access
          to, correction of, or deletion of your personal data, as well as the
          right to unsubscribe from marketing transmissions at any time.
        </p>
        <p>
          To exercise any of these rights, please contact us using the details
          below.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <p>
        If you have questions or requests regarding this Privacy Policy, email
        us at{" "}
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

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <LegalPageLayout
      locale={locale}
      active="privacy"
      badge="Data Protection"
      title="Privacy Policy"
      subtitle="Transparency on what data we collect, why we collect it, and how we safeguard your privacy across all Re-born Interactive platforms."
      lastUpdated="November 27, 2026"
      sections={sections}
    />
  );
}
