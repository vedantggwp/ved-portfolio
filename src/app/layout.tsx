import type { Metadata } from 'next'
import { DM_Serif_Display, Inter } from 'next/font/google'
import { SkipLinks } from '@/components/SkipLinks'
import { ScrollEngine } from '@/components/ScrollEngine'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Ved Gaikwad',
  description: "I don't build what's expected. I build what's needed.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body>
        <SkipLinks />
        <ScrollEngine>
          <main>{children}</main>
        </ScrollEngine>
      </body>
    </html>
  )
}
