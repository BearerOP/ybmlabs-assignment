"use client"

import { useEffect } from "react"

interface FeedbackPulseWidgetProps {
  projectKey: string
  /**
   * Optional base URL for the widget script.
   * Defaults to NEXT_PUBLIC_APP_URL or current origin.
   */
  baseUrl?: string
}

export function FeedbackPulseWidget({ projectKey, baseUrl }: FeedbackPulseWidgetProps) {
  useEffect(() => {
    if (!projectKey) {
      console.warn("FeedbackPulseWidget: projectKey is required")
      return
    }

    const resolvedBase =
      baseUrl || process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")

    if (!resolvedBase) {
      console.warn("FeedbackPulseWidget: Unable to resolve base URL for widget script")
      return
    }

    const existing = document.getElementById("feedback-pulse-embed")
    if (existing) {
      existing.remove()
    }

    const script = document.createElement("script")
    script.src = `${resolvedBase.replace(/\/$/, "")}/widget/feedback.js`
    script.async = true
    script.setAttribute("data-project-key", projectKey)
    script.id = "feedback-pulse-embed"
    document.body.appendChild(script)

    return () => {
      script.remove()
      const button = document.querySelector(".feedback-pulse-btn")
      const modal = document.querySelector(".feedback-pulse-modal")
      if (button?.parentNode) button.parentNode.removeChild(button)
      if (modal?.parentNode) modal.parentNode.removeChild(modal)
    }
  }, [projectKey, baseUrl])

  return null
}

