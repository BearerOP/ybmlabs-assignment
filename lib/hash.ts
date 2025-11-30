import { createHash } from "crypto"

export async function hashPassword(password: string): Promise<string> {
  return createHash("sha256").update(password).digest("hex")
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hash = await hashPassword(password)
  return hash === hashedPassword
}
