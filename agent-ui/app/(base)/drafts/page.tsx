import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPostsByUser } from '../../actions'

const DraftsPage = async () => {
  const { userId } = auth()

  if (!userId) {
    redirect('/')
  }

  const response = await getPostsByUser(userId)

  if (response.length === 0) {
    redirect('/')
  }

  console.log(response)

  return (
    <div className="  flex flex-col p-4 sm:px-8 sm:py-12 max-w-7xl mx-auto">
      <div className="border-b-2">
        {' '}
        <h1 className="text-3xl font-bold mb-6 font-urban text-blue-950">
          Saved Drafts
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 pt-4 md:pt-8">
        {response.map((post, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>
                <Button variant={'ghost'} size={'icon'} className="size-20">
                  <Image
                    src={
                      post.platform === 'Twitter'
                        ? '/twitter.svg'
                        : '/linkedin.svg'
                    }
                    alt={post.platform + ' logo'}
                    width={80}
                    height={80}
                  />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className=" line-clamp-3">{post.draft}</p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end items-end w-full">
                <Link
                  href={`/chat/${post.chatId}?artifactId=${post.artifactId}`}
                  className={cn(buttonVariants({}))}
                >
                  View
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DraftsPage
