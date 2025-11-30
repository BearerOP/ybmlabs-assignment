import { prisma } from "./db"
import { hashPassword } from "./hash"

export async function seedDemoUser() {
  const demoEmail = "demo@feedbackpulse.com"
  const demoPassword = "demo123"

  // Check if demo user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  })

  if (existingUser) {
    return existingUser
  }

  // Create demo user
  const hashedPassword = await hashPassword(demoPassword)
  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      password: hashedPassword,
      name: "Demo User",
    },
  })

  // Create a sample project for the demo user
  const demoProject = await prisma.project.create({
    data: {
      name: "Demo Project",
      userId: demoUser.id,
    },
  })

  // Create sample feedback entries
  await prisma.feedback.createMany({
    data: [
      {
        projectId: demoProject.id,
        email: "customer@example.com",
        message: "The new feature is amazing! Really love how intuitive it is.",
        type: "FEATURE",
        sentiment: "positive",
      },
      {
        projectId: demoProject.id,
        email: "user@test.com",
        message: "Found a bug in the checkout process. Payment doesn't go through.",
        type: "BUG",
        sentiment: "negative",
      },
      {
        projectId: demoProject.id,
        email: "another@user.com",
        message: "Could you add dark mode support? Would be great for night usage.",
        type: "FEATURE",
      },
    ],
  })

  return demoUser
}
