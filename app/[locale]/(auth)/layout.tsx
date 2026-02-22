// app/[locale]/(auth)/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import Script from 'next/script';

type Props = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
    return (
        <NextIntlClientProvider>
            <Script
  src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
  strategy="afterInteractive"
/>
            <div className="relative w-full min-h-screen overflow-x-hidden">
                {children}
            </div>
        </NextIntlClientProvider>
    );
}