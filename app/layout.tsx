import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from './providers';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fuel Tracker - Track Your Vehicle Fuel Consumption',
  description: 'A beautiful, minimal fuel tracking app for vehicles',
  manifest: '/manifest.json',
  themeColor: '#f8f6f1',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fuel Tracker',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-br from-stone-50 to-stone-100 text-stone-900`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
