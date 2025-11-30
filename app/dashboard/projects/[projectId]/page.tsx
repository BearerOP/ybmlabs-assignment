import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { FeedbackList } from "@/components/feedback-list"
import { ProjectKeySection } from "@/components/project-key-section"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProjectFeedbackPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  const { projectId } = await params

  // Verify project ownership and get project details
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      projectKey: true,
      createdAt: true,
      _count: {
        select: { feedback: true },
      },
    },
  })

  if (!project) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen relative">
      <div className="ambient-glow" />

      <div className="relative z-10">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-semibold text-foreground mb-2">{project.name}</h1>
                <p className="text-muted-foreground">View and manage feedback submissions</p>
              </div>

              <div className="dashboard-card px-6 py-4">
                <p className="text-2xl font-semibold text-foreground">{project._count.feedback}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Feedback</p>
              </div>
            </div>
          </div>

          <ProjectKeySection projectKey={project.projectKey} />

          <FeedbackList projectId={projectId} />
        </main>
      </div>
    </div>
  )
}
