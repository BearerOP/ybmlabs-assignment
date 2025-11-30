"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeedbackCard } from "@/components/feedback-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    const error = await response.json().catch(() => ({ error: "Failed to load feedback" }))
    throw new Error(error.error || `Failed to load: ${response.statusText}`)
  }
  return response.json()
}

interface FeedbackListProps {
  projectId: string
}

export function FeedbackList({ projectId }: FeedbackListProps) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState("ALL")
  const limit = 10

  const { data, error, isLoading, mutate } = useSWR(
    `/api/projects/${projectId}/feedback?page=${page}&limit=${limit}&type=${filter}`,
    fetcher,
  )

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPage(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card h-48 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-card text-center p-8">
        <p className="text-destructive">Failed to load feedback</p>
      </div>
    )
  }

  const feedback = data?.feedback || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="dashboard-card">
        <Tabs value={filter} onValueChange={handleFilterChange}>
          <TabsList className="bg-background/50">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="BUG">Bugs</TabsTrigger>
            <TabsTrigger value="FEATURE">Features</TabsTrigger>
            <TabsTrigger value="OTHER">Other</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {feedback.length === 0 ? (
        <div className="dashboard-card text-center p-12">
          <h3 className="text-xl font-semibold text-foreground mb-2">No feedback yet</h3>
          <p className="text-muted-foreground">Feedback submissions will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {feedback.map((item: any) => (
              <FeedbackCard key={item.id} feedback={item} onUpdate={mutate} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between dashboard-card">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-border"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="border-border"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
