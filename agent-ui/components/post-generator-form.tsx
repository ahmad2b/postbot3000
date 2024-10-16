'use client'

import type { AI } from '@/app/(chat)/actions'
import { UserMessage } from '@/components/message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { generateId } from 'ai'
import { useAIState, useActions, useUIState } from 'ai/rsc'
import { useState } from 'react'

interface PostGeneratorFormProps {
  id: string
  initialPostDetails?: string
  initialAudience?: string
  initialDrafts?: string
}

export function PostGeneratorForm({
  initialDrafts,
  initialAudience,
  initialPostDetails,
  id
}: PostGeneratorFormProps) {
  const [aiState] = useAIState()
  const [messages, setMessages] = useUIState<typeof AI>()
  const { sendMessage } = useActions()

  const [postDetails, setPostDetails] = useState(initialPostDetails || '')
  const [audience, setAudience] = useState(initialAudience || '')
  const [drafts, setDrafts] = useState(initialDrafts || '1')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', { postDetails, audience, drafts })

    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: generateId(),
        role: 'human',
        display: (
          <UserMessage>
            <div className="flex flex-col w-full gap-4">
              <div className="flex flex-col w-full gap-1">
                <h3 className="font-semibold font-urban">Post Details:</h3>
                <p className="font-poppins"> {postDetails}</p>
              </div>
              <div className="flex flex-col w-full gap-1">
                <h3 className="font-semibold font-urban">Audience:</h3>
                <p className="font-poppins"> {audience}</p>
              </div>
            </div>
          </UserMessage>
        )
      }
    ])

    const responseMessage = await sendMessage(
      postDetails,
      audience,
      parseInt(drafts),
      id
    )

    setMessages(currentMessages => [...currentMessages, responseMessage])
  }

  // const isButtonDisabled =
  //   !!initialPostDetails?.length || !!initialAudience

  const isButtonDisabled: boolean =
    Boolean(initialPostDetails && initialPostDetails.length > 0) ||
    Boolean(initialAudience && initialAudience.length > 0)

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-details" className="text-primary font-medium">
            Post Details
          </Label>
          <Textarea
            id="post-details"
            placeholder="Enter your post details here..."
            value={postDetails}
            onChange={e => setPostDetails(e.target.value)}
            required
            className="w-full px-3 py-2 text-primary border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience" className="text-primary font-medium">
            Audience
          </Label>
          <Input
            id="audience"
            placeholder="Define your audience"
            value={audience}
            onChange={e => setAudience(e.target.value)}
            required
            className="w-full px-3 py-2 text-primary border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="drafts" className="text-primary font-medium">
            Number of Drafts
          </Label>
          <Select value={drafts} onValueChange={setDrafts}>
            <SelectTrigger className="w-full px-3 py-2 text-primary border rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300">
              <SelectValue placeholder="Select number of drafts" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map(num => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="text-primary"
                >
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={isButtonDisabled}>
          Generate Drafts
        </Button>
      </form>
    </div>
  )
}
