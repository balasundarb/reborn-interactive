// app/[locale]/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { NavbarDemo } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

type Props = {
    children: React.ReactNode;
    params: { locale: string };
};

// Define the paths where Navbar and Footer should be hidden
const hideLayoutPaths = ['/auth', '/login', '/signup'];

export default function LocaleLayout({ children, params }: Props) {
    const pathname = usePathname();
    
    // Check if current path should hide navbar/footer
    const showLayout = !hideLayoutPaths.some(path => pathname.includes(path));
    
    return (
        <div className="relative w-full min-h-screen overflow-x-hidden">
            {showLayout && <NavbarDemo />}
            <main>
                {children}
            </main>
            {showLayout && <Footer />}
        </div>
    );
}