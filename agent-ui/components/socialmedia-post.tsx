'use client'

import { generateId } from 'ai'
import { ContentDocument } from './content-document'
import { MemoizedReactMarkdown } from './markdown'
import { PostDraft } from './post-draft'
import { SaveDraft } from './save-draft'

interface PostType {
  drafts?: string[]
  feedback?: string
}

interface AgentBodyProps {
  user_text?: string
  target_audience?: string
  edit_text?: string
  tweet?: PostType
  linkedin_post?: PostType
  n_drafts?: number
}

export default function SocialMediaPost({
  agentBody,
  chatId
}: {
  agentBody: AgentBodyProps
  chatId: string
}) {
  const {
    user_text = '',
    target_audience = '',
    edit_text = '',
    tweet = {},
    linkedin_post = {},
    n_drafts = 0
  } = agentBody || {}

  const renderPlatformContent = (
    postType: PostType = {},
    platform: string,
    chatId: string
  ) => {
    const drafts = postType.drafts || []
    const feedback = postType.feedback || ''

    return (
      <>
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{platform} Content</h2>
          {drafts.length > 0 ? (
            <>
              {drafts.map((draft, index) => {
                const artifactId = `${platform}-${generateId()}-${index}`
                return (
                  <ContentDocument
                    key={`${platform}-draft-${index}`}
                    id={artifactId}
                    type={`${platform} Draft ${index + 1}`}
                    name={`${platform} Draft ${index + 1}`}
                    content={
                      <div className="p-1 flex flex-col space-y-4">
                        <MemoizedReactMarkdown>{draft}</MemoizedReactMarkdown>
                        <div className="flex flex-wrap gap-4">
                          <SaveDraft
                            draft={draft}
                            platform={platform as 'Twitter' | 'LinkedIn'}
                            chatId={chatId}
                            artifactId={artifactId}
                          />
                          <PostDraft
                            platform={platform as 'Twitter' | 'LinkedIn'}
                          />
                        </div>
                      </div>
                    }
                  />
                )
              })}
              {feedback && (
                <ContentDocument
                  key={`${platform}-feedback`}
                  id={`${platform}-feedback`}
                  type={`${platform} Feedback`}
                  name={`${platform} Feedback`}
                  content={
                    <div className="p-1">
                      <MemoizedReactMarkdown>{feedback}</MemoizedReactMarkdown>
                    </div>
                  }
                />
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No content available</p>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col w-full gap-8">
      {renderPlatformContent(tweet, 'Twitter', chatId)}
      {renderPlatformContent(linkedin_post, 'LinkedIn', chatId)}
    </div>
  )
}
