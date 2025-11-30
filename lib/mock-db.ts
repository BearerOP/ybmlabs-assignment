// In-memory mock database for demo purposes (works without external DB)

export interface MockUser {
  id: string
  email: string
  name: string | null
  password: string // Renamed from passwordHash to match Prisma schema
  createdAt: Date
}

export interface MockProject {
  id: string
  name: string
  key: string
  userId: string
  createdAt: Date
}

export interface MockFeedback {
  id: string
  projectId: string
  type: "BUG" | "FEATURE" | "OTHER"
  message: string
  email: string | null
  sentiment: string | null
  createdAt: Date
  labels: MockLabel[]
}

export interface MockLabel {
  id: string
  name: string
  feedbackId: string
}

// In-memory storage
const store = {
  users: new Map<string, MockUser>(),
  projects: new Map<string, MockProject>(),
  feedback: new Map<string, MockFeedback>(),
  labels: new Map<string, MockLabel>(),
}

// Helper to generate IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function generateProjectKey() {
  return "fp_" + Math.random().toString(36).substring(2, 12)
}

// Seed demo data
export function seedDemoData() {
  // Check if already seeded
  if (store.users.size > 0) {
    const demoUser = Array.from(store.users.values()).find((u) => u.email === "demo@feedbackpulse.com")
    if (demoUser) return demoUser
  }

  // Create demo user with plain password for demo purposes
  const demoUser: MockUser = {
    id: generateId(),
    email: "demo@feedbackpulse.com",
    name: "Demo User",
    password: "demo123", // Plain text for demo - in production this would be hashed
    createdAt: new Date(),
  }
  store.users.set(demoUser.id, demoUser)

  // Create demo projects
  const project1: MockProject = {
    id: generateId(),
    name: "My Website",
    key: generateProjectKey(),
    userId: demoUser.id,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  }
  store.projects.set(project1.id, project1)

  const project2: MockProject = {
    id: generateId(),
    name: "Mobile App",
    key: generateProjectKey(),
    userId: demoUser.id,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  }
  store.projects.set(project2.id, project2)

  // Create sample feedback
  const feedbackItems = [
    {
      type: "BUG" as const,
      message: "The login button doesn't work on mobile Safari",
      email: "user1@example.com",
      sentiment: "negative",
    },
    {
      type: "FEATURE" as const,
      message: "Would love to have dark mode support!",
      email: "user2@example.com",
      sentiment: "positive",
    },
    {
      type: "OTHER" as const,
      message: "Great product, keep up the good work!",
      email: null,
      sentiment: "positive",
    },
    {
      type: "BUG" as const,
      message: "Images are loading very slowly on the dashboard",
      email: "user3@example.com",
      sentiment: "negative",
    },
    {
      type: "FEATURE" as const,
      message: "Can you add export to CSV functionality?",
      email: "user4@example.com",
      sentiment: "neutral",
    },
  ]

  feedbackItems.forEach((item, index) => {
    const feedback: MockFeedback = {
      id: generateId(),
      projectId: project1.id,
      type: item.type,
      message: item.message,
      email: item.email,
      sentiment: item.sentiment,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      labels: [],
    }
    store.feedback.set(feedback.id, feedback)
  })

  return demoUser
}

// Mock database operations - matches Prisma API
export const mockDb = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      if (where.id) return store.users.get(where.id) || null
      if (where.email) return Array.from(store.users.values()).find((u) => u.email === where.email) || null
      return null
    },
    create: async ({ data }: { data: { email: string; password: string; name?: string } }) => {
      const user: MockUser = {
        id: generateId(),
        email: data.email,
        password: data.password,
        name: data.name || null,
        createdAt: new Date(),
      }
      store.users.set(user.id, user)
      return user
    },
  },
  project: {
    findMany: async ({ where, orderBy, include }: { where: { userId: string }; orderBy?: any; include?: any }) => {
      const projects = Array.from(store.projects.values())
        .filter((p) => p.userId === where.userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // Include feedback count if requested
      if (include?._count?.select?.feedback) {
        return projects.map((p) => ({
          ...p,
          _count: {
            feedback: Array.from(store.feedback.values()).filter((f) => f.projectId === p.id).length,
          },
        }))
      }
      return projects
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: any }) => {
      const project = store.projects.get(where.id) || null
      if (project && include?._count?.select?.feedback) {
        return {
          ...project,
          _count: {
            feedback: Array.from(store.feedback.values()).filter((f) => f.projectId === project.id).length,
          },
        }
      }
      return project
    },
    findFirst: async ({ where, include }: { where: { key?: string; id?: string; userId?: string }; include?: any }) => {
      const project =
        Array.from(store.projects.values()).find((p) => {
          if (where.key && p.key !== where.key) return false
          if (where.id && p.id !== where.id) return false
          if (where.userId && p.userId !== where.userId) return false
          return true
        }) || null

      if (project && include?._count?.select?.feedback) {
        return {
          ...project,
          _count: {
            feedback: Array.from(store.feedback.values()).filter((f) => f.projectId === project.id).length,
          },
        }
      }
      return project
    },
    create: async ({ data, include }: { data: { name: string; userId: string }; include?: any }) => {
      const project: MockProject = {
        id: generateId(),
        name: data.name,
        key: generateProjectKey(),
        userId: data.userId,
        createdAt: new Date(),
      }
      store.projects.set(project.id, project)

      if (include?._count?.select?.feedback) {
        return { ...project, _count: { feedback: 0 } }
      }
      return project
    },
    update: async ({ where, data }: { where: { id: string }; data: { name?: string } }) => {
      const project = store.projects.get(where.id)
      if (!project) throw new Error("Project not found")
      if (data.name) project.name = data.name
      return project
    },
    updateMany: async ({ where, data }: { where: { id: string; userId: string }; data: { name?: string } }) => {
      const project = Array.from(store.projects.values()).find((p) => p.id === where.id && p.userId === where.userId)
      if (!project) return { count: 0 }
      if (data.name) project.name = data.name
      return { count: 1 }
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const project = store.projects.get(where.id)
      store.projects.delete(where.id)
      // Delete associated feedback
      Array.from(store.feedback.values())
        .filter((f) => f.projectId === where.id)
        .forEach((f) => store.feedback.delete(f.id))
      return project
    },
    deleteMany: async ({ where }: { where: { id: string; userId: string } }) => {
      const project = Array.from(store.projects.values()).find((p) => p.id === where.id && p.userId === where.userId)
      if (!project) return { count: 0 }
      store.projects.delete(project.id)
      // Delete associated feedback
      Array.from(store.feedback.values())
        .filter((f) => f.projectId === project.id)
        .forEach((f) => store.feedback.delete(f.id))
      return { count: 1 }
    },
  },
  feedback: {
    findMany: async ({
      where,
      skip = 0,
      take = 10,
      orderBy,
      include,
    }: {
      where: { projectId: string; type?: string }
      skip?: number
      take?: number
      orderBy?: { createdAt: "desc" | "asc" }
      include?: { labels?: boolean }
    }) => {
      const items = Array.from(store.feedback.values()).filter((f) => {
        if (f.projectId !== where.projectId) return false
        if (where.type && f.type !== where.type) return false
        return true
      })

      if (orderBy?.createdAt === "desc") {
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }

      return items.slice(skip, skip + take).map((f) => ({
        ...f,
        labels: include?.labels !== false ? Array.from(store.labels.values()).filter((l) => l.feedbackId === f.id) : [],
      }))
    },
    findUnique: async ({ where, include }: { where: { id: string }; include?: { labels?: boolean } }) => {
      const feedback = store.feedback.get(where.id)
      if (!feedback) return null
      return {
        ...feedback,
        labels:
          include?.labels !== false
            ? Array.from(store.labels.values()).filter((l) => l.feedbackId === feedback.id)
            : [],
      }
    },
    count: async ({ where }: { where: { projectId: string; type?: string } }) => {
      return Array.from(store.feedback.values()).filter((f) => {
        if (f.projectId !== where.projectId) return false
        if (where.type && f.type !== where.type) return false
        return true
      }).length
    },
    create: async ({
      data,
    }: {
      data: { projectId: string; type: "BUG" | "FEATURE" | "OTHER"; message: string; email?: string }
    }) => {
      const feedback: MockFeedback = {
        id: generateId(),
        projectId: data.projectId,
        type: data.type,
        message: data.message,
        email: data.email || null,
        sentiment: null,
        createdAt: new Date(),
        labels: [],
      }
      store.feedback.set(feedback.id, feedback)
      return feedback
    },
    update: async ({ where, data }: { where: { id: string }; data: { sentiment?: string } }) => {
      const feedback = store.feedback.get(where.id)
      if (!feedback) throw new Error("Feedback not found")
      if (data.sentiment) feedback.sentiment = data.sentiment
      return feedback
    },
  },
  feedbackLabel: {
    create: async ({ data }: { data: { name: string; feedbackId: string } }) => {
      const label: MockLabel = {
        id: generateId(),
        name: data.name,
        feedbackId: data.feedbackId,
      }
      store.labels.set(label.id, label)
      return label
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const label = store.labels.get(where.id)
      store.labels.delete(where.id)
      return label
    },
  },
}
