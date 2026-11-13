import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import HeartAtmosphere from '@/components/HeartAtmosphere';

export const metadata: Metadata = {
  title: 'Yêu Thương ♥',
  description: 'Góc nhỏ riêng tư của hai chúng mình',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yêu Thương',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'Yêu Thương ♥',
    description: 'Góc nhỏ riêng tư của hai chúng mình',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#ff477e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* PWA – iOS Safari cần link riêng cho apple-touch-icon */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
      </head>
      <body>
        <HeartAtmosphere />
        <Navigation />
        <main className="container content-layer">{children}</main>
      </body>
    </html>
  );
}
