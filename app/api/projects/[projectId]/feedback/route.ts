import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await params
  const { searchParams } = new URL(request.url)

  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const type = searchParams.get("type") || "ALL"

  const skip = (page - 1) * limit

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  // Build where clause
  const where: any = { projectId }
  if (type !== "ALL") {
    where.type = type
  }

  // Get feedback with pagination
  const [feedback, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        labels: true,
      },
    }),
    prisma.feedback.count({ where }),
  ])

  return NextResponse.json({
    feedback,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
