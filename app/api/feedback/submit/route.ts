import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const runtime = "nodejs"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

const feedbackSchema = z.object({
  projectKey: z.string(),
  type: z.enum(["BUG", "FEATURE", "OTHER"]),
  message: z.string().min(1, "Message is required"),
  email: z.string().email().optional().or(z.literal("")),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectKey, type, message, email } = feedbackSchema.parse(body)

    // Find project by key
    const project = await prisma.project.findUnique({
      where: { projectKey },
    })

    if (!project) {
      return NextResponse.json({ error: "Invalid project key" }, { status: 404, headers: CORS_HEADERS })
    }

    // Get user agent
    const userAgent = request.headers.get("user-agent") || undefined

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        projectId: project.id,
        type,
        message,
        email: email || undefined,
        userAgent,
      },
    })

    // Return with CORS headers
    return NextResponse.json({ success: true, feedback }, { status: 201, headers: CORS_HEADERS })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400, headers: CORS_HEADERS })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: CORS_HEADERS })
  }
}

// Enable CORS for widget
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  })
}
