"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Sparkles } from "lucide-react"
import { AddLabelDialog } from "@/components/add-label-dialog"
import { toast } from "sonner"

interface FeedbackCardProps {
  feedback: {
    id: string
    type: string
    message: string
    email?: string
    userAgent?: string
    sentiment?: string
    createdAt: string
    labels: Array<{
      id: string
      label: string
    }>
  }
  onUpdate: () => void
}

const typeConfig = {
  BUG: { label: "Bug", color: "bg-destructive/15 text-destructive border-destructive/20" },
  FEATURE: { label: "Feature", color: "bg-primary/15 text-primary border-primary/20" },
  OTHER: { label: "Other", color: "bg-secondary/15 text-secondary border-secondary/20" },
}

const sentimentConfig = {
  positive: { label: "Positive", color: "bg-chart-1/15 text-chart-1 border-chart-1/20" },
  neutral: { label: "Neutral", color: "bg-muted/50 text-muted-foreground border-border" },
  negative: { label: "Negative", color: "bg-destructive/15 text-destructive border-destructive/20" },
}

export function FeedbackCard({ feedback, onUpdate }: FeedbackCardProps) {
  const [showAddLabel, setShowAddLabel] = useState(false)
  const [deletingLabel, setDeletingLabel] = useState<string | null>(null)

  const typeInfo = typeConfig[feedback.type as keyof typeof typeConfig]
  const sentimentInfo = feedback.sentiment ? sentimentConfig[feedback.sentiment as keyof typeof sentimentConfig] : null

  const handleDeleteLabel = async (labelId: string) => {
    setDeletingLabel(labelId)
    try {
      const res = await fetch(`/api/feedback/${feedback.id}/labels?labelId=${labelId}`, { method: "DELETE" })

      if (res.ok) {
        onUpdate()
      }
    } catch {
      alert("Failed to delete label")
    } finally {
      setDeletingLabel(null)
    }
  }

  const handleAnalyzeSentiment = () => {
    toast.info("Coming Soon", {
      description: "Sentiment analysis feature is coming soon! Stay tuned.",
      duration: 3000,
    })
  }

  return (
    <>
      <div className="dashboard-card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={typeInfo.color}>
              {typeInfo.label}
            </Badge>
            {sentimentInfo && (
              <Badge variant="outline" className={sentimentInfo.color}>
                {sentimentInfo.label}
              </Badge>
            )}
            {!feedback.sentiment && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeSentiment}
                className="h-6 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 bg-transparent"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Analyze Sentiment
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{format(new Date(feedback.createdAt), "MMM d, yyyy h:mm a")}</p>
        </div>

        <p className="text-foreground leading-relaxed mb-4">{feedback.message}</p>

        {feedback.email && <p className="text-sm text-muted-foreground mb-4">From: {feedback.email}</p>}

        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border/50">
          {feedback.labels.map((label) => (
            <Badge key={label.id} variant="secondary" className="bg-muted text-foreground pr-1">
              {label.label}
              <button
                onClick={() => handleDeleteLabel(label.id)}
                disabled={deletingLabel === label.id}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddLabel(true)}
            className="h-6 px-2 text-xs border-border hover:border-primary/50"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Label
          </Button>
        </div>
      </div>

      <AddLabelDialog
        open={showAddLabel}
        onOpenChange={setShowAddLabel}
        feedbackId={feedback.id}
        onSuccess={onUpdate}
      />
    </>
  )
}
