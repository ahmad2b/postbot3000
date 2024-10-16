'use client'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from './ui/button'

interface PostDraftProps {
  platform: 'Twitter' | 'LinkedIn'
}

export const PostDraft = ({ platform }: PostDraftProps) => {
  const handleClick = () => {
    toast.info('This feature is on the way! 🚀')
  }

  return (
    <form className="flex-1 flex items-center">
      <Button
        className="w-full"
        variant={'outline'}
        type="button"
        onClick={handleClick}
      >
        Post on{' '}
        {platform === 'Twitter' ? (
          <Image
            src={'/twitter.svg'}
            alt="Twitter Icon"
            width={24}
            height={24}
            className="ml-2"
          />
        ) : (
          <Image
            src={'/linkedin.svg'}
            alt="LinkedIn Icon"
            width={24}
            height={24}
            className="ml-2"
          />
        )}
      </Button>
    </form>
  )
}
