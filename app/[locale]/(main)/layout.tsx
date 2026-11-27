import { NextIntlClientProvider } from 'next-intl';
import { MyNavbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScrollToTop from '@/components/layout/scrollToTop';
import { VisitorTracker } from '@/components/layout/visitTracker';
import SmoothPageTransition from '@/components/shared/SmoothPageTransition';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <NextIntlClientProvider>
      <SmoothScrollProvider />
      <div className="relative w-full min-h-screen overflow-x-clip">
        <VisitorTracker />
        <MyNavbar />
        <main>
          <SmoothPageTransition>
            {children}
          </SmoothPageTransition>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </NextIntlClientProvider >
  );
}