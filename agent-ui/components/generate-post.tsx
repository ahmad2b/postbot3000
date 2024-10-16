'use client'
import type { AI } from '@/app/(chat)/actions'
import { UserMessage } from '@/components/message'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { SignIn, useUser } from '@clerk/nextjs'
import { generateId } from 'ai'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import { useState } from 'react'

export const GeneratePostButton = () => {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { showForm } = useActions()
  const { user } = useUser()
  const [showSignIn, setShowSignIn] = useState(false)

  const handleClicked = async () => {
    if (!user) {
      setShowSignIn(true)
      return
      // return <SignIn />
    }

    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: generateId(),
        role: 'human',
        display: (
          <UserMessage>
            PostBot 3000, generate engaging posts for me!
          </UserMessage>
        )
      }
    ])

    const responseMessage = await showForm(
      'PostBot 3000, generate engaging posts for me!'
    )

    setMessages(currentMessages => [...currentMessages, responseMessage])
  }

  const handleDialogClose = () => {
    setShowSignIn(false)
  }

  return (
    <>
      <Button
        className="px-8 text-lg w-full rounded-full drop-shadow"
        size={'lg'}
        onClick={handleClicked}
      >
        Generate a Post
      </Button>
      <Dialog open={showSignIn} onOpenChange={handleDialogClose}>
        <DialogContent className="flex items-center justify-center bg-transparent border-none shadow-none">
          <SignIn />
        </DialogContent>
      </Dialog>
    </>
  )
}
