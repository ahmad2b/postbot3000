import { UIState } from '@/app/(chat)/actions'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useArtifacts } from './contexts/artifact-context'

export interface ChatList {
  messages: UIState[]
  userId: string | null
  isShared: boolean
  onArtifactClick?: (artifact: {
    id: string
    type: string
    content: React.ReactNode
  }) => void
}

export function ChatList({
  messages,
  userId,
  isShared,
  onArtifactClick
}: ChatList) {
  const { artifacts, addArtifact, selectedArtifact, setSelectedArtifact } =
    useArtifacts()

  if (!messages.length) {
    return null
  }

  const searchParams = useSearchParams()
  const artifactId = searchParams.get('artifactId')

  useEffect(() => {
    console.log('artifactId', artifactId)
    console.log('artifacts', artifacts)

    if (artifactId && typeof artifactId === 'string') {
      const artifact = artifacts.find(a => a.id === artifactId)
      if (artifact) {
        setSelectedArtifact(artifact)
      }
    }
  }, [artifacts, setSelectedArtifact])

  return (
    <div className="relative mx-auto max-w-2xl px-4">
      {messages.map((message, index) => (
        <div key={message.id} className={cn('my-4')}>
          {React.cloneElement(message.display as React.ReactElement, {
            onArtifactClick
          })}
          {index < messages.length - 1 && <Separator className="hidden" />}
        </div>
      ))}
    </div>
  )
}
