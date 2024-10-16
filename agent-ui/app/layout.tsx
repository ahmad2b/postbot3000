import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'

import '@/app/globals.css'
import { Providers } from '@/components/providers'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { NextFontWithVariable } from 'next/dist/compiled/@next/font'
import { DM_Serif_Display, Poppins, Urbanist } from 'next/font/google'

const fontUrban: NextFontWithVariable = Urbanist({
  subsets: ['latin'],
  variable: '--font-urban'
})

const fontPoppins: NextFontWithVariable = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700']
})

const fontDmSansDisplay: NextFontWithVariable = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dmSansDisplay',
  weight: ['400']
})

export const metadata = {
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined,
  title: {
    default: 'PostBot 3000 AI Agent',
    template: `%s - PostBot 3000 AI Agent`
  },
  description:
    'PostBot 3000 is your AI Social Media Assistant, designed to generate, schedule, and post content seamlessly across X (formerly Twitter) and LinkedIn. Enhance your social media strategy with intelligent automation.',
  icons: {
    icon: '/favicon.ico'
  }
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'antialiased',
          GeistSans.variable,
          GeistMono.variable,
          fontUrban.variable,
          fontDmSansDisplay.variable,
          fontPoppins.className
        )}
      >
        <Providers
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Toaster
            position="top-center"
            className="font-poppins"
            richColors={true}
          />
          <div className="flex flex-col min-h-screen">
            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
