'use client'

import * as React from 'react'

import { useActions, useUIState } from 'ai/rsc'

import { type AI } from '@/app/(chat)/actions'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { sendMessage, showForm } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div>
      <div className="relative flex w-full justify-center space-x-4 items-center overflow-hidden sm:rounded-full border px-2 bg-background/50 backdrop-blur py-1">
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group/custom-button">
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-10  group-hover/custom-button:hidden bg-background/50"
                  type="button"
                >
                  <Image
                    src={'/plus.svg'}
                    alt="New Post"
                    width={32}
                    height={32}
                    className=""
                  />
                  <span className="sr-only">New Post</span>
                </Button>
                <div className="hidden group-hover/custom-button:block">
                  <Button
                    onClick={async () => {
                      router.push('/new')
                    }}
                  >
                    New post
                  </Button>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>New Post</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
