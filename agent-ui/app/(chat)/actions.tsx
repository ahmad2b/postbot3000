import { LoadingSpinnerWithMessage } from '@/components/loading-spinner-message'
import { BotCard, SpinnerMessage, UserMessage } from '@/components/message'
import { PostGeneratorForm } from '@/components/post-generator-form'
import SocialMediaPost from '@/components/socialmedia-post'
import { AgentState, Chat, Message, Role } from '@/lib/types'
import { getLoadingMessage } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import { generateId } from 'ai'
import {
  createAI,
  createStreamableUI,
  getAIState,
  getMutableAIState
} from 'ai/rsc'
import { RemoteRunnable } from 'langchain/runnables/remote'
import { ReactNode } from 'react'
import { saveChat } from '../actions'

const showForm = async (input: string) => {
  'use server'

  const aiState = getMutableAIState()
  const messageId = generateId()
  const chatId = aiState.get().chatId

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: messageId,
        role: 'human',
        content: input
      }
    ]
  })

  const uiStream = createStreamableUI(<SpinnerMessage />)
  uiStream.update(<SpinnerMessage />)

  const aiMessageId = generateId()

  await new Promise<void>(resolve => {
    uiStream.update(
      <BotCard>
        <SpinnerMessage />
      </BotCard>
    )
    setTimeout(() => {
      uiStream.update(
        <BotCard>
          <div>
            <PostGeneratorForm id={aiMessageId} />
          </div>
        </BotCard>
      )
      resolve()
    }, 200)
  })

  uiStream.done()
  aiState.done({
    ...aiState.get(),
    chatId: chatId,
    messages: [
      ...aiState.get().messages,
      {
        id: aiMessageId,
        role: 'ai',
        name: 'PostBot3000Form',
        content: JSON.stringify({
          postDetails: '',
          audience: '',
          drafts: '1',
          id: aiMessageId
        })
      }
    ]
  })

  return {
    id: generateId(),
    role: 'ai',
    display: uiStream.value
  }
}

const sendMessage = async (
  input: string,
  audience: string,
  n_drafts: number,
  postForm300Id?: string
): Promise<UIState> => {
  'use server'

  const aiState = getMutableAIState()
  const messageId = generateId()
  const chatId = aiState.get().chatId

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: messageId,
        role: 'human',
        content: input
      }
    ]
  })

  const existingMessageIndex = aiState
    .get()
    .messages.findIndex((message: any) => message.id === postForm300Id)

  if (existingMessageIndex !== -1) {
    const updatedMessages = [...aiState.get().messages]
    updatedMessages[existingMessageIndex] = {
      ...updatedMessages[existingMessageIndex],
      content: JSON.stringify({
        postDetails: input,
        audience: audience,
        drafts: n_drafts,
        id: postForm300Id
      })
    }

    aiState.update({
      ...aiState.get(),
      messages: updatedMessages
    })
  }

  const uiStream = createStreamableUI()

  let streamData: AgentState = {
    tweet: {
      drafts: [],
      feedback: ''
    },
    linkedin_post: {
      drafts: [],
      feedback: ''
    },
    n_drafts: n_drafts,
    target_audience: audience,
    edit_text: '',
    user_text: input,
    workflow_status: ''
  }

  ;(async () => {
    uiStream.update(<SpinnerMessage />)

    const remoteChain = new RemoteRunnable({
      url: process.env.AGENT_URL || 'http://localhost:8000',
      options: {
        timeout: 600000
      }
    })

    const stream = remoteChain.streamEvents(
      {
        user_text: input,
        target_audience: audience,
        edit_text: '',
        tweet: {
          drafts: [],
          feedback: ''
        },
        linkedin_post: {
          drafts: [],
          feedback: ''
        },
        n_drafts: n_drafts,
        workflow_status: ''
      },
      {
        version: 'v2',
        configurable: {
          thread_id: chatId || '',
          checkpoint_ns: '',
          checkpoint_id: ''
        }
      }
    )

    try {
      let lastEventKey = ''

      for await (const event of stream) {
        const eventType = event.event
        const eventName = event.name
        const eventKey = `${eventName}-${eventType}`

        if (eventKey !== lastEventKey) {
          console.log('Event type:', eventType)
          console.log('Event name:', eventName)
          lastEventKey = eventKey
        }

        if (eventType === 'on_chain_end') {
          const data = event.data.output
          switch (eventName) {
            case 'editor':
              break
            case 'tweet_writer':
              console.log('tweet_writer data:', data)
              streamData.tweet = {
                drafts: [...data.tweet.drafts],
                feedback: data.tweet.feedback
              }
              uiStream.update(
                <BotCard>
                  <div className="flex flex-col gap-4 ">
                    <LoadingSpinnerWithMessage
                      message={getLoadingMessage('tweetWriting')}
                    />
                    <SocialMediaPost agentBody={streamData} chatId={chatId} />
                  </div>
                </BotCard>
              )
              break
            case 'linkedin_writer':
              console.log('linkedin_writer data:', data)
              streamData.linkedin_post = {
                drafts: [...data.linkedin_post.drafts],
                feedback: data.linkedin_post.feedback
              }
              uiStream.update(
                <BotCard>
                  <div className="flex flex-col gap-4 ">
                    <LoadingSpinnerWithMessage
                      message={getLoadingMessage('linkedInWriting')}
                    />
                    <SocialMediaPost agentBody={streamData} chatId={chatId} />
                  </div>
                </BotCard>
              )
              break
            case 'supervisor':
              streamData.edit_text = data.edit_text
              streamData.workflow_status = data.workflow_status
              if (data.workflow_status === 'completed') {
                console.log('supervisor data case completed: \n', data)
                streamData = data

                aiState.done({
                  ...aiState.get(),
                  chatId: chatId,
                  messages: [
                    ...aiState.get().messages,
                    {
                      id: generateId(),
                      role: 'ai',
                      name: 'AgentResponse',
                      content: JSON.stringify(streamData),
                      display: (
                        <BotCard>
                          <div className="flex flex-col gap-4 ">
                            <SocialMediaPost
                              agentBody={streamData}
                              chatId={chatId}
                            />
                          </div>
                        </BotCard>
                      )
                    }
                  ]
                })

                uiStream.update(
                  <BotCard>
                    <div className="flex flex-col gap-4 ">
                      <SocialMediaPost agentBody={streamData} chatId={chatId} />
                    </div>
                  </BotCard>
                )
              } else if (data.workflow_status === 'in_progress') {
                console.log('supervisor data case in_progress: \n', data)

                uiStream.update(
                  <BotCard>
                    <div className="flex flex-col gap-4 ">
                      <LoadingSpinnerWithMessage
                        message={getLoadingMessage('review')}
                      />
                      <SocialMediaPost agentBody={streamData} chatId={chatId} />
                    </div>
                  </BotCard>
                )
              }
              break
            case 'tweet_critique':
              console.log('tweet_critique data:', data)
              streamData.tweet.feedback = data.tweet.feedback
              uiStream.update(
                <BotCard>
                  <div className="flex flex-col gap-4 ">
                    <LoadingSpinnerWithMessage
                      message={getLoadingMessage('critique')}
                    />
                    <SocialMediaPost agentBody={streamData} chatId={chatId} />
                  </div>
                </BotCard>
              )
              break
            case 'linkedin_critique':
              console.log('linkedin_critique data:', data)
              streamData.linkedin_post.feedback = data.linkedin_post.feedback
              uiStream.update(
                <BotCard>
                  <div className="flex flex-col gap-4 ">
                    <LoadingSpinnerWithMessage
                      message={getLoadingMessage('critique')}
                    />
                    <SocialMediaPost agentBody={streamData} chatId={chatId} />
                  </div>
                </BotCard>
              )
              break
          }
        }
      }
    } catch (error) {
      console.error('Error processing stream:', error)
    }
  })().catch(error => {
    console.error('Error in async function:', error)
  })

  return {
    id: messageId,
    role: 'ai',
    display: uiStream.value
  }
}

export type AIState = {
  chatId: string
  messages: Array<Message>
}

export type UIState = {
  id: string
  role: Role
  display: ReactNode
  spinner?: ReactNode
}

export const AI = createAI<AIState, UIState[]>({
  initialAIState: {
    chatId: generateId(),
    messages: []
  },
  initialUIState: [],
  actions: {
    sendMessage,
    showForm
  },
  onSetAIState: async ({ state, done }) => {
    'use server'

    if (!done) return

    const { userId } = auth()
    if (!userId) return

    const { chatId, messages } = state

    const createdAt = new Date()
    const path = `/chat/${chatId}`

    const firstMessageContent =
      (messages[0].content as string) || 'PostBot 3000'
    const title = firstMessageContent.substring(0, 100)

    const chat: Chat = {
      chatId,
      title,
      userId,
      createdAt,
      messages,
      path
    }

    await saveChat(chat)
  },
  onGetUIState: async () => {
    'use server'

    const { userId } = auth()

    if (userId) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat): UIState[] => {
  const chatId = aiState.chatId
  return aiState.messages.map((message, index) => {
    if (message.role === 'ai') {
      if (message.name === 'PostBot3000Form') {
        const data = JSON.parse(message.content)
        return {
          id: `${aiState.chatId}-${index}`,
          role: message.role,
          display: (
            <BotCard>
              <PostGeneratorForm
                initialPostDetails={data.postDetails}
                initialAudience={data.audience}
                initialDrafts={data.drafts}
                id={data.id}
              />
            </BotCard>
          )
        }
      } else if (message.name === 'AgentResponse') {
        const data = JSON.parse(message.content)
        return {
          id: `${aiState.chatId}-${index}`,
          role: message.role,
          display: (
            <BotCard>
              <SocialMediaPost agentBody={data} chatId={chatId} />
            </BotCard>
          )
        }
      } else {
        return {
          id: `${aiState.chatId}-${index}`,
          role: message.role,
          display: message.display
        }
      }
    } else if (message.role === 'human') {
      return {
        id: `${aiState.chatId}-${index}`,
        role: message.role,
        display: <UserMessage>{message.content}</UserMessage>
      }
    }

    return {
      id: `${aiState.chatId}-${index}`,
      role: message.role,
      display: <UserMessage>{message.content}</UserMessage>
    }
  })
}
