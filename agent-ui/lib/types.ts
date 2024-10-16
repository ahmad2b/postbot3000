export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

type Post = {
  drafts: string[]
  feedback: string
}

export interface AgentState {
  user_text: string
  target_audience: string
  edit_text: string
  tweet: Post
  linkedin_post: Post
  n_drafts: number
  workflow_status: string
}

export type Role = 'human' | 'ai' | 'tool'

export type Message = {
  role: Role
  content: string
  id?: string
  name?: string
  display?: React.ReactNode
}
export interface Chat extends Record<string, any> {
  chatId: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export interface Artifact {
  id: string
  type: string
  content: React.ReactNode
}

export interface ContentPost {
  draft: string
  published: boolean
  createdAt: string
  updatedAt: string
  title: string
  authorId: string
  platform: string
  chatId: string
  artifactId: string
}
