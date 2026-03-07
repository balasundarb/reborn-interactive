import { NextIntlClientProvider } from 'next-intl';
import { MyNavbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ScrollToTop from '@/components/layout/scrollToTop';
import { VisitorTracker } from '@/components/layout/visitTracker';
import NetflixRedTransition from '@/components/shared/NetflixRedTransition';

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <NextIntlClientProvider>
      <div className="relative w-full min-h-screen overflow-x-hidden">
        <VisitorTracker />
        <MyNavbar />
        <main>
          {/* <NetflixRedTransition> */}
            {children}
          {/* </NetflixRedTransition> */}
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </NextIntlClientProvider >
  );
}