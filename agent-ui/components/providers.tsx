'use client'

import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ClerkProvider>
      <NextThemesProvider {...props}>
        <SidebarProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SidebarProvider>
      </NextThemesProvider>
    </ClerkProvider>
  )
}
