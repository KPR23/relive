import { Toaster } from '@/src/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeToggle } from '../components/ThemeToggle';
import TRPCProvider from '../providers/TRPCProvider';
import ThemeProvider from '../providers/ThemeProvider';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'ReLive',
  description:
    'Relive - modern photo gallery application designed for sharing and organizing photos with family and close friends.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            {children}
            <Toaster />
            <ThemeToggle />
            <Analytics />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
