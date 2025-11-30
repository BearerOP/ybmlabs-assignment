"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, Eye, Code } from "lucide-react"
import { format } from "date-fns"
import { EmbedCodeDialog } from "@/components/embed-code-dialog"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    projectKey: string
    createdAt: string
    _count: {
      feedback: number
    }
  }
  onUpdate: () => void
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const router = useRouter()
  const [showEmbed, setShowEmbed] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        onUpdate()
      } else if (res.status === 401) {
        // If unauthorized, clear session and redirect to login
        const { clearSessionAndRedirect } = await import("@/lib/utils-cookies")
        clearSessionAndRedirect()
      } else {
        alert("Failed to delete project")
      }
    } catch {
      alert("Failed to delete project")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="dashboard-card hover:border-primary/20 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1" onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground">{format(new Date(project.createdAt), "MMM d, yyyy")}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Feedback
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEmbed(true)} className="cursor-pointer">
                <Code className="w-4 h-4 mr-2" />
                Embed Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} disabled={deleting} className="cursor-pointer text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6" onClick={() => router.push(`/dashboard/projects/${project.id}`)}>
          <div className="p-4 rounded-lg bg-background/50 border border-border/50">
            <p className="text-2xl font-semibold text-foreground">{project._count.feedback}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Feedback</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">Project Key</p>
          <code className="text-xs text-primary font-mono mt-1 block">{project.projectKey}</code>
        </div>
      </div>

      <EmbedCodeDialog open={showEmbed} onOpenChange={setShowEmbed} projectKey={project.projectKey} />
    </>
  )
}
