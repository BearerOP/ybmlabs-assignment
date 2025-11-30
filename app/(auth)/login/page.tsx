import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-helpers"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const session = await getSession()
  if (session?.user) {
    redirect("/dashboard")
  }

  const { from } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="ambient-glow" />

      <div className="w-full max-w-md relative z-10">
        <div className="dashboard-card">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your Feedback Pulse account</p>
          </div>

          <LoginForm redirectTo={from || "/dashboard"} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
