'use client'

import { Chat } from '@/components/chat'
import { Button } from '@/components/ui/button'
import { Message } from '@/lib/types'
import { X } from 'lucide-react'
import { useCallback } from 'react'
import { useArtifacts } from './contexts/artifact-context'
interface ChatWithArtifactsProps {
  chatId: string
  userId: string | null
  missingKeys: string[]
  initialMessages?: Message[]
}

export function ChatWithArtifacts({
  chatId,
  userId,
  missingKeys,
  initialMessages
}: ChatWithArtifactsProps) {
  const { addArtifact, selectedArtifact, setSelectedArtifact } = useArtifacts()

  const closeArtifact = useCallback(() => {
    setSelectedArtifact(null)
  }, [setSelectedArtifact])

  return (
    <div className="flex group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] h-full ">
      <div
        className={`flex-grow transition-all duration-300 ${selectedArtifact ? 'w-2/3' : 'w-full'}`}
      >
        <Chat
          chatId={chatId}
          userId={userId}
          missingKeys={missingKeys}
          onArtifactCreated={addArtifact}
          onArtifactClicked={setSelectedArtifact}
          initialMessages={initialMessages}
        />
      </div>
      {selectedArtifact && (
        <div className="w-1/3 h-full bg-background border-l flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">{selectedArtifact.type}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeArtifact}
              aria-label="Close artifact"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div>{selectedArtifact.content}</div>
          </div>
        </div>
      )}
    </div>
  )
}
