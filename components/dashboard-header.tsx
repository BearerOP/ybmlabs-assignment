"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { clearSessionAndRedirect } from "@/lib/utils-cookies"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Clear server-side session
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Always clear client-side cookies and storage, then redirect
      clearSessionAndRedirect()
    }
  }

  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-semibold text-foreground">Feedback Pulse</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  )
}
