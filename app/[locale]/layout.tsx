// app/[locale]/layout.tsx

import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { NavbarDemo } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    
    return (
        <div className="relative w-full min-h-screen overflow-x-hidden">
            <NavbarDemo />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
}