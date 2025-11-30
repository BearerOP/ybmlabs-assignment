import { auth } from "./auth"
import { headers } from "next/headers"
import type { NextRequest } from "next/server"

/**
 * Get session from server component or server action
 */
export async function getSession() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })
  return session
}

/**
 * Get session from NextRequest (for middleware)
 */
export async function getSessionFromRequest(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  return session
}

