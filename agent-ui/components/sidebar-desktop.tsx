import { Sidebar } from '@/components/sidebar'

import { ChatHistory } from '@/components/chat-history'
import { cn } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { UserMenu } from './user-menu'

export async function SidebarDesktop() {
  const { userId } = auth()

  // if (!userId) {
  //   return null
  // }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px] ">
      <div className="m-2 md:m-4 border rounded-3xl shadow bg-background h-full flex flex-col">
        <div className="p-4 border-b-2 border-b-stone-100">
          <Link href="/new" rel="nofollow" className="flex items-center">
            <Image
              src={'/logo.svg'}
              alt="Logo"
              height={48}
              width={48}
              className="size-8 mr-2"
            />
            <h1 className="font-urban text-lg font-bold md:text-xl text-blue-950">
              PostBot 3000
            </h1>
          </Link>
        </div>

        <div className="p-4 border-b-2 border-b-stone-100">
          <menu>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href={'/'}
                  prefetch={false}
                  className={cn(
                    buttonVariants({
                      className: 'w-full flex items-center justify-start',
                      variant: 'ghost'
                    })
                  )}
                >
                  <Image
                    src={'/home.svg'}
                    alt={'Home Icon'}
                    height={24}
                    width={24}
                    className="mr-2"
                  />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={'/drafts'}
                  prefetch={false}
                  className={cn(
                    buttonVariants({
                      className: 'w-full flex items-center justify-start',
                      variant: 'ghost'
                    })
                  )}
                >
                  <Image
                    src={'/library.svg'}
                    alt={'Drafts Icon'}
                    height={24}
                    width={24}
                    className="mr-2"
                  />
                  Saved Drafts
                </Link>
              </li>
            </ul>
          </menu>
        </div>
        {/* <Separator /> */}
        {/* @ts-ignore */}
        {userId && (
          <div className="flex-grow">
            <ChatHistory userId={userId} />
          </div>
        )}
        <div className="border-t-2 mt-auto border-stone-100 p-4">
          {userId ? (
            <UserMenu />
          ) : (
            <Link
              href={'/sign-up'}
              className={cn(
                buttonVariants({
                  className: 'w-full'
                })
              )}
            >
              Signup
            </Link>
          )}
        </div>
      </div>
    </Sidebar>
  )
}
