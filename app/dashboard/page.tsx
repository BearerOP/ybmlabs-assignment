import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-helpers"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectsList } from "@/components/projects-list"
import { FeedbackPulseWidget } from "@/components/feedback-pulse-widget"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen relative">
      <div className="ambient-glow" />

      <div className="relative z-10">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold text-foreground mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage your feedback collection projects</p>
          </div>

          <ProjectsList />
        </main>
      </div>
      {/* <FeedbackPulseWidget projectKey="cmik78gb70003rlbdsk2ksuxr" /> */}
    </div>
  )
}
