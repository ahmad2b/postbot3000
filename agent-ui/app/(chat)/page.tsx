import { AI } from '@/app/(chat)/actions'
import { auth } from '@clerk/nextjs/server'

import { getMissingKeys } from '@/app/actions'
import { ChatWithArtifacts } from '@/components/chat-with-artifacts'
import { generateId } from 'ai'

export default async function IndexPage() {
  const id = generateId()
  const { userId } = auth()
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <ChatWithArtifacts
        chatId={id}
        userId={userId}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
