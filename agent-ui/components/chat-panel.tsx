import * as React from 'react'

import type { AI } from '@/app/(chat)/actions'
import { shareChat } from '@/app/actions'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { ChatShareDialog } from '@/components/chat-share-dialog'
import { useArtifacts } from '@/components/contexts/artifact-context'
import { FooterText } from '@/components/footer'
import { PromptForm } from '@/components/prompt-form'
import { Button } from '@/components/ui/button'
import { IconShare } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { useAIState, useUIState } from 'ai/rsc'

export interface ChatPanelProps {
  chatId?: string
  title?: string
  input: string
  setInput: (value: string) => void
  isAtBottom: boolean
  scrollToBottom: () => void
  onArtifactCreated?: (artifact: {
    id: string
    type: string
    content: React.ReactNode
  }) => void
}

export function ChatPanel({
  chatId,
  title,
  input,
  setInput,
  isAtBottom,
  scrollToBottom,
  onArtifactCreated
}: ChatPanelProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const { selectedArtifact } = useArtifacts()

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0  bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]',
        selectedArtifact ? 'w-2/3' : 'w-full'
      )}
    >
      <ButtonScrollToBottom
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <div className="mx-auto sm:max-w-3xl sm:px-4">
        {messages?.length >= 2 ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              {chatId && title ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <IconShare className="mr-2" />
                    Share
                  </Button>
                  <ChatShareDialog
                    open={shareDialogOpen}
                    onOpenChange={setShareDialogOpen}
                    onCopy={() => setShareDialogOpen(false)}
                    shareChat={shareChat}
                    chat={{
                      chatId,
                      title,
                      messages: aiState.messages
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-4  px-4 py-2 md:py-4">
          <div className="justify-center flex items-center">
            <div className="w-fit flex items-center justify-center p-2 sm:px-3 rounded-full">
              <PromptForm input={input} setInput={setInput} />
            </div>
          </div>
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
