"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Download } from "lucide-react"

interface EmbedCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectKey: string
}

export function EmbedCodeDialog({ open, onOpenChange, projectKey }: EmbedCodeDialogProps) {
  const [copied, setCopied] = useState({ simple: false, advanced: false, react: false, component: false })
  const [activeTab, setActiveTab] = useState("simple")
  const [reactSubTab, setReactSubTab] = useState("demo")

  const origin = typeof window !== "undefined" ? window.location.origin : ""

  const simpleEmbedCode = `<script src="${origin}/widget/embed?key=${projectKey}"></script>`

  const advancedEmbedCode = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${origin}/widget/feedback.js';
    script.setAttribute('data-project-key', '${projectKey}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`

  const reactEmbedCode = `import { FeedbackPulseWidget } from "@/components/feedback-pulse-widget"

export default function Page() {
  return (
    <>
      {/* Your page content */}
      <FeedbackPulseWidget projectKey="${projectKey}" />
    </>
  )
}`

  const componentCode = `"use client"

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
    script.src = \`\${resolvedBase.replace(/\\/$/, "")}/widget/feedback.js\`
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
}`

  const handleCopy = (type: "simple" | "advanced" | "react" | "component") => {
    const map = {
      simple: simpleEmbedCode,
      advanced: advancedEmbedCode,
      react: reactEmbedCode,
      component: componentCode,
    }
    const codeToCopy = map[type]
    navigator.clipboard.writeText(codeToCopy)
    setCopied((prev) => ({ ...prev, [type]: true }))
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([componentCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "feedback-pulse-widget.tsx"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-">
        <DialogHeader>
          <DialogTitle className="text-foreground">Embed Code</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Copy and paste the code before the closing &lt;/body&gt; tag on your website
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-background/50 mb-4">
              <TabsTrigger value="simple">Simple (Recommended)</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="react">Next.js / React</TabsTrigger>
            </TabsList>

            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === "simple" && (
                  <motion.div
                    key="simple-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <TabsContent value="simple" className="space-y-4">
                      <div className="relative">
                        <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto">
                          <code className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                            {simpleEmbedCode}
                          </code>
                        </pre>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-2 right-2"
                        >
                          <Button
                            onClick={() => handleCopy("simple")}
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {copied.simple ? (
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
                        </motion.div>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-sm text-foreground">
                          <strong>✨ Recommended:</strong> Simple one-line embed that automatically loads the widget with your
                          project key.
                        </p>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "advanced" && (
                  <motion.div
                    key="advanced-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <TabsContent value="advanced" className="space-y-4">
                      <div className="relative">
                        <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto">
                          <code className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                            {advancedEmbedCode}
                          </code>
                        </pre>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="absolute top-2 right-2"
                        >
                          <Button
                            onClick={() => handleCopy("advanced")}
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            {copied.advanced ? (
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
                        </motion.div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 border border-border">
                        <p className="text-sm text-muted-foreground">
                          Advanced embed code with explicit script loading. Use this if you need more control over when and how
                          the widget loads.
                        </p>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}

                {activeTab === "react" && (
                  <motion.div
                    key="react-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <TabsContent value="react" className="space-y-4">
                      <Tabs value={reactSubTab} onValueChange={setReactSubTab} className="w-full">
                        <TabsList className="bg-background/50 mb-4">
                          <TabsTrigger value="demo">Demo</TabsTrigger>
                          <TabsTrigger value="component">Component</TabsTrigger>
                        </TabsList>

                        <div className="relative min-h-[250px]">
                          <AnimatePresence mode="wait" initial={false}>
                            {reactSubTab === "demo" && (
                              <motion.div
                                key="demo-subtab"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                              >
                                <TabsContent value="demo" className="space-y-4">
                                  <div className="relative">
                                    <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto">
                                      <code className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                                        {reactEmbedCode}
                                      </code>
                                    </pre>
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="absolute top-2 right-2"
                                    >
                                      <Button
                                        onClick={() => handleCopy("react")}
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                                      >
                                        {copied.react ? (
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
                                    </motion.div>
                                  </div>
                                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-sm text-foreground">
                                      <strong>💡 Usage:</strong> Import and use the component in any Next.js page or layout.
                                      The widget will automatically inject and manage the feedback script.
                                    </p>
                                  </div>
                                </TabsContent>
                              </motion.div>
                            )}

                            {reactSubTab === "component" && (
                              <motion.div
                                key="component-subtab"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                              >
                                <TabsContent value="component" className="space-y-4">
                                  <div className="relative">
                                    <pre className="p-4 rounded-lg bg-background border border-border overflow-x-auto max-h-[400px] overflow-y-auto">
                                      <code className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                                        {componentCode}
                                      </code>
                                    </pre>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          onClick={() => handleCopy("component")}
                                          size="sm"
                                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                          {copied.component ? (
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
                                      </motion.div>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                          onClick={handleDownload}
                                          size="sm"
                                          variant="outline"
                                          className="border-border hover:bg-foreground/50"
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          Download
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                                    <p className="text-sm text-muted-foreground">
                                      <strong className="text-foreground">Component File:</strong> Save this as{" "}
                                      <code className="px-1 py-0.5 bg-background rounded text-xs">feedback-pulse-widget.tsx</code>{" "}
                                      in your <code className="px-1 py-0.5 bg-background rounded text-xs">components</code>{" "}
                                      directory. This component handles script injection, cleanup, and automatic widget initialization.
                                    </p>
                                  </div>
                                </TabsContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </Tabs>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>

          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> The widget will appear as a floating button on the
              bottom right of your website. Visitors can click it to submit feedback.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
