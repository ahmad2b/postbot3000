import React from 'react'

import { cn } from '@/lib/utils'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      <span className="font-medium">PostBot 3000</span> may make mistakes.
      Please verify the content before posting.
    </p>
  )
}
