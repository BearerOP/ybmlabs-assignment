import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-helpers"
import { SignupForm } from "@/components/signup-form"

export default async function SignupPage() {
  const session = await getSession()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="ambient-glow" />

      <div className="w-full max-w-md relative z-10">
        <div className="dashboard-card">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Create account</h1>
            <p className="text-muted-foreground">Start collecting feedback in minutes</p>
          </div>

          <SignupForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
