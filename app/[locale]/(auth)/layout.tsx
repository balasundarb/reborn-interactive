// app/[locale]/(auth)/layout.tsx
import { NextIntlClientProvider } from 'next-intl';

type Props = {
    children: React.ReactNode;
};

export default function AuthLayout({ children }: Props) {
    return (
        <NextIntlClientProvider>
            <div className="relative w-full min-h-screen overflow-x-hidden">
                {children}
            </div>
        </NextIntlClientProvider>
    );
}