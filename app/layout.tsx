import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from './providers';
import BrowserDebugInfo from '@/components/debug/browser-debug';
import ErrorBoundary from '@/components/error-boundary';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f8f6f1',
};

export const metadata: Metadata = {
  title: 'FuelSense - Track Your Vehicle Fuel Consumption',
  description: 'A beautiful, minimal fuel tracking app for vehicles',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FuelSense',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-gradient-to-br from-stone-50 to-stone-100 dark:from-slate-950 dark:to-slate-900 text-stone-900 dark:text-slate-100`}
        suppressHydrationWarning
      >
        <BrowserDebugInfo />
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
