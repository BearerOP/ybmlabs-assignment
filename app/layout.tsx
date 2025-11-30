import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Feedback Pulse - Collect Feedback Seamlessly',
  description: 'A modern feedback collection platform with an embeddable widget and powerful admin dashboard. Collect user feedback, manage submissions, and improve your product.',
  keywords: ['feedback', 'widget', 'user feedback', 'feedback collection', 'SaaS'],
  authors: [{ name: 'YBM Labs' }],
  creator: 'YBM Labs',
  publisher: 'YBM Labs',
  metadataBase: new URL('https://ybmlabs.bearerop.live'),
  alternates: {
    canonical: 'https://ybmlabs.bearerop.live',
  },
  openGraph: {
    title: 'Feedback Pulse - Collect Feedback Seamlessly',
    description: 'A modern feedback collection platform with an embeddable widget and powerful admin dashboard.',
    url: 'https://ybmlabs.bearerop.live',
    siteName: 'Feedback Pulse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feedback Pulse - Collect Feedback Seamlessly',
    description: 'A modern feedback collection platform with an embeddable widget and powerful admin dashboard.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
