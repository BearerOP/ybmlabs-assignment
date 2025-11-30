"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { ProjectCard } from "@/components/project-card"

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    // If unauthorized, clear session and redirect to login
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        const { clearSessionAndRedirect } = await import("@/lib/utils-cookies")
        clearSessionAndRedirect()
        return null
      }
    }
    const error = await response.json().catch(() => ({ error: "Failed to load projects" }))
    throw new Error(error.error || `Failed to load: ${response.statusText}`)
  }
  return response.json()
}

export function ProjectsList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { data, error, isLoading, mutate } = useSWR("/api/projects", fetcher)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card h-48 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-card text-center p-8">
        <p className="text-destructive">Failed to load projects</p>
      </div>
    )
  }

  const projects = data?.projects || []

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="dashboard-card text-center p-12">
          <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Create your first project to start collecting feedback</p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} onUpdate={mutate} />
          ))}
        </div>
      )}

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onSuccess={mutate} />
    </>
  )
}
