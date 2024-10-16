'use client'

import { MemoizedReactMarkdown } from '@/components/markdown'
import { spinner } from '@/components/spinner'
import { CodeBlock } from '@/components/ui/codeblock'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { cn } from '@/lib/utils'
import { StreamableValue } from 'ai/rsc'
import Image from 'next/image'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex mt-2 size-10 shrink-0 select-none items-center justify-center">
        <Image src={'/person.svg'} alt="User" width={40} height={40} />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2 bg-accent rounded-3xl p-4 shadow-md drop-shadow-sm">
        <div className="px-4">{children}</div>
      </div>
    </div>
  )
}

export function BotMessage({
  content,
  className
}: {
  content: string | StreamableValue<string>
  className?: string
}) {
  const text = useStreamableText(content)

  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}>
      <div className="flex size-10 shrink-0 select-none items-center justify-center rounded-md ">
        <Image src={'/bot.svg'} alt="User" width={40} height={40} />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1 bg-background rounded-3xl p-4 shadow-md drop-shadow-sm">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {text}
        </MemoizedReactMarkdown>
      </div>
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-10 shrink-0 select-none items-center justify-center rounded-md  text-primary-foreground ',
          !showAvatar && 'invisible'
        )}
      >
        <Image src={'/bot.svg'} alt="AI" width={40} height={40} />
      </div>
      <div className="ml-4 flex-1 pl-2 bg-background rounded-3xl p-4 shadow-md drop-shadow-sm">
        <div className="px-4">{children}</div>
      </div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
    </div>
  )
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-10 shrink-0 select-none items-center justify-center ">
        <Image src={'/bot.svg'} alt="AI" width={40} height={40} />
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
    </div>
  )
}
