import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const runtime = "nodejs"

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
    include: {
      _count: {
        select: { feedback: true },
      },
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  try {
    const body = await request.json()
    const { name } = updateProjectSchema.parse(body)

    const project = await prisma.project.updateMany({
      where: {
        id: projectId,
        userId: session.user.id,
      },
      data: { name },
    })

    if (project.count === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: { feedback: true },
        },
      },
    })

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params

  const result = await prisma.project.deleteMany({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
