import { FC, memo } from 'react'
import ReactMarkdown, { Options } from 'react-markdown'

const components = {
  h1: (props: any) => (
    <h1 className="text-2xl lg:text-3xl scroll-m-20 font-extrabold tracking-tight text-neutral-900 dark:text-neutral-300">
      {props.children}
    </h1>
  ),
  h2: (props: any) => (
    <h2 className="mt-4 scroll-m-20 border-b pb-2 text-[1.25rem] font-semibold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-300">
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="mt-4 scroll-m-20 text-[1.25rem] font-semibold tracking-tight text-neutral-900 underline-offset-4 dark:text-neutral-300">
      {props.children}
    </h3>
  ),
  h4: (props: any) => (
    <h4 className="text-xl scroll-m-20 font-semibold tracking-tight text-neutral-900 dark:text-neutral-300">
      {props.children}
    </h4>
  ),
  p: (props: any) => (
    <p className="leading-7 text-neutral-900 dark:text-neutral-300 [&:not(:first-child)]:mt-6">
      {props.children}
    </p>
  ),
  blockqoute: (props: any) => (
    <blockquote className="mt-6 border-l-2 border-emerald-400 pl-6 italic dark:border-emerald-300">
      {props.children}
    </blockquote>
  ),
  ol: (props: any) => (
    <ol className="my-6 ml-6 list-decimal text-neutral-900 dark:text-neutral-300 [&>li]:mt-2">
      {props.children}
    </ol>
  ),
  ul: (props: any) => (
    <ul className="my-6 ml-6 list-disc text-neutral-900 dark:text-neutral-300 [&>li]:mt-2">
      {props.children}
    </ul>
  ),
  sup: (props: any) => (
    <sup className="pl-1 align-sub text-xs text-emerald-700 dark:text-emerald-400">
      {props.children}
    </sup>
  ),
  a: ({ href, children }: any) => {
    const isInternalLink = href.startsWith('#')

    return (
      <a
        href={href}
        // If it's an internal link, don't add target and rel attributes
        target={isInternalLink ? '_self' : '_blank'}
        rel={isInternalLink ? '' : 'noopener noreferrer'}
        className="text-emerald-700 underline dark:text-emerald-300"
      >
        {children}
      </a>
    )
  },
  li: (props: any) => (
    <li className="my-2 ml-6 list-decimal text-neutral-900 dark:text-neutral-300 [&>li]:mt-2">
      {props.children}
    </li>
  ),
  footer: (props: any) => (
    <footer className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
      {props.children}
    </footer>
  )
}

export const MemoizedReactMarkdown: FC<Options> = memo(
  props => <ReactMarkdown components={components} {...props} />,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
)
