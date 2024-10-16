import Image from 'next/image'
import { GeneratePostButton } from './generate-post'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col text-center gap-4 md:gap-8 rounded-3xl border bg-white  px-8 py-16 shadow-lg">
        <div className="mx-auto w-full flex items-center justify-center">
          <Image
            src={'/dynamic-man.gif'}
            alt="PostBot 3000"
            width={240}
            height={240}
            // className="absolute top-0 left-0 right-0 mx-auto opacity-50"
          />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl  font-urban text-sky-950">
          Welcome to PostBot 3000!
        </h1>
        <p className="leading-normal text-muted-foreground font-poppins text-balance drop-shadow-lg">
          PostBot 3000 is your AI Social Media Agent, designed to generate,
          schedule, and post content seamlessly across X (formerly Twitter) and
          LinkedIn.
        </p>
        <div className="flex items-center justify-center mt-4 w-full">
          <GeneratePostButton />
        </div>
      </div>
    </div>
  )
}
