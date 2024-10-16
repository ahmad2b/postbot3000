'use client'

import { getPost, savePost } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { ContentPost } from '@/lib/types'
import { useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SaveDraftProps {
  draft: string
  platform: 'Twitter' | 'LinkedIn'
  chatId: string
  artifactId: string
}

export const SaveDraft = ({
  draft,
  platform,
  chatId,
  artifactId
}: SaveDraftProps) => {
  const { userId } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isDraftSaved, setIsDraftSaved] = useState(false)

  useEffect(() => {
    const checkDraftStatus = async () => {
      if (userId) {
        const result = await getPost(artifactId, userId)
        setIsDraftSaved(result !== null)
      }
    }

    checkDraftStatus()
  }, [artifactId, userId])

  if (!userId) {
    return null
  }

  // console.log('chatId', chatId)

  const payload = {
    draft,
    authorId: userId,
    createdAt: new Date().toISOString(),
    published: false,
    title: 'Draft',
    updatedAt: new Date().toISOString(),
    platform,
    chatId,
    artifactId
  } satisfies ContentPost

  const handleSaveDraft = async () => {
    setIsLoading(true)

    const result = await savePost(payload)
    setIsLoading(false)

    if (result && result.error) {
      toast.error(result.error)
      return
    }

    setIsDraftSaved(true)
    toast.success('Draft saved!')
  }

  return (
    <Button
      className="hover:border w-full flex-1 flex items-center"
      variant={'secondary'}
      onClick={handleSaveDraft}
      disabled={isLoading || isDraftSaved}
    >
      {isLoading ? (
        <Image
          src={'/dots-loading.svg'}
          alt="Loading"
          width={24}
          height={24}
          className="mr-2 animate-spin"
        />
      ) : (
        <Image
          src={'/save.svg'}
          alt="Save Drafts"
          width={24}
          height={24}
          className="mr-2"
        />
      )}
      {isLoading ? 'Saving...' : isDraftSaved ? 'Draft Saved' : 'Save Draft'}
    </Button>
  )
}
