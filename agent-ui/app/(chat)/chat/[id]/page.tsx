import { notFound, redirect } from 'next/navigation'

import { AI } from '@/app/(chat)/actions'
import { getChat, getMissingKeys } from '@/app/actions'
import { ChatWithArtifacts } from '@/components/chat-with-artifacts'
import { auth } from '@clerk/nextjs/server'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = auth()
  const missingKeys = await getMissingKeys()

  if (!userId) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const chat = await getChat(params.id, userId)

  if (!chat || 'error' in chat) {
    redirect('/')
  } else {
    if (chat?.userId !== userId) {
      notFound()
    }

    return (
      <AI initialAIState={{ chatId: chat.chatId, messages: chat.messages }}>
        <ChatWithArtifacts
          chatId={chat.chatId}
          userId={userId}
          missingKeys={missingKeys}
          initialMessages={chat.messages}
        />
      </AI>
    )
  }
}
