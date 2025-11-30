import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const runtime = "nodejs"

const labelSchema = z.object({
  label: z.string().min(1, "Label is required"),
})

export async function POST(request: NextRequest, { params }: { params: Promise<{ feedbackId: string }> }) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { feedbackId } = await params

  try {
    const body = await request.json()
    const { label } = labelSchema.parse(body)

    // Verify feedback belongs to user's project
    const feedback = await prisma.feedback.findFirst({
      where: {
        id: feedbackId,
        project: {
          userId: session.user.id,
        },
      },
    })

    if (!feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Create label
    const feedbackLabel = await prisma.feedbackLabel.create({
      data: {
        feedbackId,
        label,
      },
    })

    return NextResponse.json({ label: feedbackLabel }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ feedbackId: string }> }) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { feedbackId } = await params
  const { searchParams } = new URL(request.url)
  const labelId = searchParams.get("labelId")

  if (!labelId) {
    return NextResponse.json({ error: "Label ID required" }, { status: 400 })
  }

  // Verify ownership
  const label = await prisma.feedbackLabel.findFirst({
    where: {
      id: labelId,
      feedbackId,
      feedback: {
        project: {
          userId: session.user.id,
        },
      },
    },
  })

  if (!label) {
    return NextResponse.json({ error: "Label not found" }, { status: 404 })
  }

  await prisma.feedbackLabel.delete({
    where: { id: labelId },
  })

  return NextResponse.json({ success: true })
}
