import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'Our Love App 💖',
  description: 'A personal space for us',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Navigation />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
