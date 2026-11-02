import type { Metadata } from 'next';
import { DM_Sans, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Muddapappu — Best Online Deals & Coupons in India',
  description:
    'Find the best deals, discounts & coupons on Amazon, Flipkart, Myntra, Ajio, Swiggy, Zomato, Zepto, BigBasket. Real-time price tracking, active vs expired tagging, and smart filters.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Muddapappu — Best Online Deals & Coupons in India',
    description:
      'Real-time deals across Amazon, Flipkart, Myntra, Ajio & food delivery apps. Filter by price, discount, store & category.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable} dark`}>
      <body className="min-h-screen bg-ink-950 font-sans text-ink-100 antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}