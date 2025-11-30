"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const labelSchema = z.object({
  label: z.string().min(1, "Label is required"),
})

type LabelFormData = z.infer<typeof labelSchema>

interface AddLabelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedbackId: string
  onSuccess: () => void
}

export function AddLabelDialog({ open, onOpenChange, feedbackId, onSuccess }: AddLabelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
  })

  const onSubmit = async (data: LabelFormData) => {
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/feedback/${feedbackId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Failed to add label")
        return
      }

      reset()
      onSuccess()
      onOpenChange(false)
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Label</DialogTitle>
          <DialogDescription className="text-muted-foreground">Add a label to organize this feedback</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g., Priority, Mobile, UI"
              {...register("label")}
              className="bg-background/50 border-input"
            />
            {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "Adding..." : "Add Label"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
