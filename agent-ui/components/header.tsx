import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { UserMenu } from '@/components/user-menu'
import { cn } from '@/lib/utils'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ChatHistory } from './chat-history'
import { SidebarMobile } from './sidebar-mobile'

export async function UserOrLogin() {
  const { userId } = auth()

  const user = await currentUser()

  return (
    <div>
      {userId && user && (
        <>
          <SidebarMobile>
            <ChatHistory userId={userId} />
          </SidebarMobile>
          {/* <SidebarToggle /> */}
        </>
      )}
      <div className="flex items-center">
        {userId && user ? (
          <UserMenu />
        ) : (
          <Button variant="default" asChild className="-ml-2">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between w-full">
        <div>
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

        <div>
          <menu>
            <ul className="flex items-center space-x-2">
              <li>
                <Link
                  href="/"
                  className={cn(
                    buttonVariants({
                      variant: 'link'
                    })
                  )}
                >
                  Home
                </Link>
              </li>
            </ul>
          </menu>
        </div>

        <div>
          <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
            <UserOrLogin />
          </React.Suspense>
        </div>
      </div>
    </header>
  )
}
