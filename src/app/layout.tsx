import type { Metadata } from 'next'
import { DM_Serif_Display, Inter, Instrument_Serif } from 'next/font/google'
import { SkipLinks } from '@/components/SkipLinks'
import { ScrollEngine } from '@/components/ScrollEngine'
import { R3FCanvasLoader } from '@/components/R3FCanvasLoader'
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

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-provocation',
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
    <html lang="en" className={`${dmSerif.variable} ${inter.variable} ${instrumentSerif.variable}`}>
      <body>
        <SkipLinks />
        <R3FCanvasLoader />
        <ScrollEngine>
          <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
        </ScrollEngine>
      </body>
    </html>
  )
}
