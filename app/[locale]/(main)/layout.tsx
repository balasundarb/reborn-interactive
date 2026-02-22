// app/[locale]/(main)/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import{ MyNavbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScrollToTop from '@/components/layout/scrollToTop';

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
    return (
        <NextIntlClientProvider>
            <div className="relative w-full min-h-screen overflow-x-hidden">
                <MyNavbar />
                <main>
                    {children}
                </main>
                <Footer />
                  <ScrollToTop />
            </div>
        </NextIntlClientProvider>
    );
}