import { ArtifactProvider } from '@/components/contexts/artifact-context'
import { SidebarDesktop } from '@/components/sidebar-desktop'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <ArtifactProvider>
      <div className="relative flex h-dvh overflow-hidden bg-muted">
        <SidebarDesktop />
        {children}
      </div>
    </ArtifactProvider>
  )
}
