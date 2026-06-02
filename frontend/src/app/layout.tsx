import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';
import { APP_NAME } from '@/config/constants';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Video meetings made simple',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Toaster theme="light" position="top-right" />
      </body>
    </html>
  );
}
