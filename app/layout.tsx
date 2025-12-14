import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from './providers';
import BrowserDebugInfo from '@/components/debug/browser-debug';
import ErrorBoundary from '@/components/error-boundary';
import PWAInstallPrompt from '@/components/pwa/pwa-install-prompt';
import { ToastProvider } from '@/components/ui/toast';
import { ThemeCustomizationProvider } from '@/lib/theme-customization';
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
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f6f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  title: 'FuelSense - Track Your Vehicle Fuel Consumption',
  description: 'Track your vehicle fuel consumption with ease. Monitor efficiency, costs, and analytics offline.',
  manifest: '/manifest.json',
  applicationName: 'FuelSense',
  keywords: ['fuel tracker', 'vehicle', 'mileage', 'efficiency', 'car', 'bike', 'offline'],
  authors: [{ name: 'FuelSense' }],
  creator: 'FuelSense',
  publisher: 'FuelSense',
  formatDetection: {
    telephone: false,
  },
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
    startupImage: [
      { url: '/icon-512.png', media: '(device-width: 320px)' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
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
          <ThemeCustomizationProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
                <PWAInstallPrompt />
              </ToastProvider>
            </AuthProvider>
          </ThemeCustomizationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
