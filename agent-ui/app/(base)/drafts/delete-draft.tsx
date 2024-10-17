'use client'
import { removePost } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeleteDraftButtonProps {
  userId: string
  draftId: string
}

export const DeleteDraftButton = ({
  draftId,
  userId
}: DeleteDraftButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  return (
    <Button
      className="flex items-center"
      variant={'outline'}
      onClick={async () => {
        setIsLoading(true)
        const response = await removePost(draftId, userId)
        setIsLoading(false)

        if (response && response.error) {
          toast.error("Couldn't delete draft, try again later.")
          return
        }

        toast.success('Draft deleted successfully')
        router.refresh()
      }}
      disabled={isLoading}
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </Button>
  )
}
