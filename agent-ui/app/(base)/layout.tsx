import { Header } from '@/components/header'
import React from 'react'

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
    </div>
  )
}

export default BaseLayout
