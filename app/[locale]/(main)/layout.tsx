// app/[locale]/(main)/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { NavbarDemo } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

type Props = {
    children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
    return (
        <NextIntlClientProvider>
            <div className="relative w-full min-h-screen overflow-x-hidden">
                <NavbarDemo />
                <main>
                    {children}
                </main>
                <Footer />
            </div>
        </NextIntlClientProvider>
    );
}