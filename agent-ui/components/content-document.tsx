'use client'

import { Button } from '@/components/ui/button'
import { Artifact } from '@/lib/types'
import { FileTextIcon } from '@radix-ui/react-icons'
import { useArtifacts } from './contexts/artifact-context'

interface ContentDocumentProps {
  id: string
  type: string
  name: string
  content: React.ReactNode
}

export const ContentDocument = ({
  content,
  id,
  name,
  type
}: ContentDocumentProps) => {
  const { addArtifact, setSelectedArtifact } = useArtifacts()

  const handleOpenArtifact = () => {
    const artifact: Artifact = {
      id,
      type,
      content
    }
    addArtifact(artifact)
    setSelectedArtifact(artifact)
  }

  return (
    <div
      className="flex bg-secondary hover:cursor-pointer items-center gap-4 border rounded-xl p-4 group hover:bg-secondary/80"
      onClick={handleOpenArtifact}
    >
      <Button className="" size={'icon'}>
        <FileTextIcon className="size-6 flex-shrink-0" />
      </Button>
      <p>{name}</p>
    </div>
  )
}
