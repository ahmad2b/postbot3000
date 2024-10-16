'use server'

import { redis } from '@/lib/redis'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth, currentUser } from '@clerk/nextjs/server'

import { ContentPost, type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  const { userId: session } = auth()

  if (!session) {
    return []
  }

  const user = await currentUser()

  if (userId !== user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  try {
    const pipeline = redis.pipeline()
    const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const { userId: session } = auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const user = await currentUser()

  if (userId !== user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const { userId: session } = auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const user = await currentUser()

  // Convert uid to string for consistent comparison with session.user.id
  const uid = String(await redis.hget(`chat:${id}`, 'userId'))

  if (uid !== user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await redis.del(`chat:${id}`)
  await redis.zrem(`user:chat:${user?.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const { userId: session } = auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const user = await currentUser()

  const chats: string[] = await redis.zrange(`user:chat:${user?.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = redis.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${user?.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const { userId: session } = auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  const user = await currentUser()

  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== user?.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.chatId}`
  }

  await redis.hmset(`chat:${chat.chatId}`, payload)

  return payload
}

export async function saveChat(chat: Chat) {
  const { userId: session } = auth()
  const user = await currentUser()

  console.log('Saving chat', chat)

  if (session && user) {
    const pipeline = redis.pipeline()
    pipeline.hmset(`chat:${chat.chatId}`, chat)
    pipeline.zadd(`user:chat:${chat.userId}`, {
      score: Date.now(),
      member: `chat:${chat.chatId}`
    })
    await pipeline.exec()
    console.log('Chat saved')
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = [
    'AGENT_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'UPSTASH_REDIS_REST_TOKEN',
    'UPSTASH_REDIS_REST_URL'
  ]
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}

export async function savePost(post: ContentPost) {
  const { userId: session } = auth()
  const user = await currentUser()

  if (!session || user?.id !== post.authorId) {
    return { error: 'Unauthorized' }
  }

  const postId = `post:${Date.now()}` // Generate a unique post ID

  const payload = {
    draft: post.draft,
    published: post.published ? '1' : '0',
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: post.title,
    authorId: post.authorId,
    chatId: post.chatId,
    platform: post.platform,
    artifactId: post.artifactId
  }

  await redis.hmset(postId, payload)
  await redis.zadd(`user:posts:${user.id}`, {
    score: Date.now(),
    member: postId
  })

  return { success: true, postId }
}

export async function getPost(postId: string, userId: string) {
  const { userId: session } = auth()
  const user = await currentUser()

  if (!session || user?.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const post = await redis.hgetall(postId)

  if (!post || post.authorId !== userId) {
    return null
  }

  return {
    ...post,
    draft: post.draft,
    published: post.published === '1' ? true : false
  }
}

export async function updatePost(
  postId: string,
  updatedPost: Partial<ContentPost>,
  userId: string
) {
  const { userId: session } = auth()
  const user = await currentUser()

  if (!session || user?.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const existingPost = await redis.hgetall(postId)

  if (!existingPost || existingPost.authorId !== userId) {
    return { error: 'Unauthorized' }
  }

  const updatedPayload = {
    ...existingPost,
    draft: updatedPost.draft
      ? JSON.stringify(updatedPost.draft)
      : existingPost.draft,
    published:
      updatedPost.published !== undefined
        ? updatedPost.published
          ? '1'
          : '0'
        : existingPost.published,
    updatedAt: new Date().toISOString(),
    title: updatedPost.title || existingPost.title
  }

  await redis.hmset(postId, updatedPayload)
  return { success: true, postId }
}

export async function removePost(postId: string, userId: string) {
  const { userId: session } = auth()
  const user = await currentUser()

  if (!session || user?.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const existingPost = await redis.hgetall(postId)

  if (!existingPost || existingPost.authorId !== userId) {
    return { error: 'Unauthorized' }
  }

  await redis.del(postId)
  await redis.zrem(`user:posts:${user.id}`, postId)

  return { success: true }
}

interface UnauthorizedError {
  error: string
}

type GetPostsByUserResponse = ContentPost[]

export async function getPostsByUser(
  userId: string
): Promise<GetPostsByUserResponse> {
  const { userId: session } = auth()
  const user = await currentUser()

  try {
    // if (!session || user?.id !== userId) {
    //   return { error: 'Unauthorized' }
    // }
    const postIds: string[] = await redis.zrange(
      `user:posts:${userId}`,
      0,
      -1,
      { rev: true }
    )
    const pipeline = redis.pipeline()

    for (const postId of postIds) {
      pipeline.hgetall(postId)
    }

    const posts = await pipeline.exec()

    return posts.map((post: any) => ({
      ...post,
      published: post?.published === '1' ? true : false
    }))
  } catch (error) {
    return []
  }
}
