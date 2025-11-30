"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Code, Copy, Check } from "lucide-react"
import { EmbedCodeDialog } from "@/components/embed-code-dialog"

interface ProjectKeySectionProps {
  projectKey: string
}

export function ProjectKeySection({ projectKey }: ProjectKeySectionProps) {
  const [showEmbed, setShowEmbed] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyKey = () => {
    navigator.clipboard.writeText(projectKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="dashboard-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">Project Key</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-primary font-mono bg-background/50 px-3 py-2 rounded-lg border border-border">
                {projectKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="border-border hover:border-primary/50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this key to embed the feedback widget on your website
            </p>
          </div>
          <Button
            onClick={() => setShowEmbed(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Code className="w-4 h-4 mr-2" />
            Get Embed Code
          </Button>
        </div>
      </div>

      <EmbedCodeDialog open={showEmbed} onOpenChange={setShowEmbed} projectKey={projectKey} />
    </>
  )
}

