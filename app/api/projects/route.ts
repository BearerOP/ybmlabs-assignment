import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/db"
import { z } from "zod"

export const runtime = "nodejs"

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
})

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify user exists in database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    // Clear invalid session and return 401
    const response = NextResponse.json(
      { error: "Invalid session. Please log in again." },
      { status: 401 },
    )
    response.headers.set(
      "Set-Cookie",
      "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
    )
    return response
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { feedback: true },
      },
    },
  })

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      // Clear invalid session and return 401
      const response = NextResponse.json(
        { error: "Invalid session. Please log in again." },
        { status: 401 },
      )
      response.headers.set(
        "Set-Cookie",
        "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
      )
      return response
    }

    const body = await request.json()
    const { name } = createProjectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        name,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { feedback: true },
        },
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    // Check for foreign key constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 },
      )
    }
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
