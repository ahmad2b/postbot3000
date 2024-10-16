'use client'
import React, { createContext, useCallback, useContext, useState } from 'react'

interface Artifact {
  id: string
  type: string
  content: React.ReactNode
}

interface ArtifactContextType {
  artifacts: Artifact[]
  addArtifact: (artifact: Artifact) => void
  selectedArtifact: Artifact | null
  setSelectedArtifact: (artifact: Artifact | null) => void
}

const ArtifactContext = createContext<ArtifactContextType | undefined>(
  undefined
)

export function ArtifactProvider({ children }: { children: React.ReactNode }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null
  )

  // const addArtifact = (artifact: Artifact) => {
  //   setArtifacts(prevArtifacts => [...prevArtifacts, artifact])
  // }

  const addArtifact = useCallback((artifact: Artifact) => {
    setArtifacts(prevArtifacts => {
      if (!prevArtifacts.some(a => a.id === artifact.id)) {
        return [...prevArtifacts, artifact]
      }
      return prevArtifacts
    })
  }, [])

  const contextValue = {
    artifacts,
    addArtifact,
    selectedArtifact,
    setSelectedArtifact
  }

  return (
    <ArtifactContext.Provider value={contextValue}>
      {children}
    </ArtifactContext.Provider>
  )
}

export function useArtifacts() {
  const context = useContext(ArtifactContext)
  if (context === undefined) {
    throw new Error('useArtifacts must be used within an ArtifactProvider')
  }
  return context
}
