import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const runtime = "nodejs"

export async function POST() {
  try {
    const headersList = await headers()
    await auth.api.signOut({
      headers: headersList,
    })
  return NextResponse.json({ success: true })
  } catch (error) {
    // Even if signOut fails, try to clear the cookie
    const response = NextResponse.json({ success: true })
    response.headers.set(
      "Set-Cookie",
      "better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
    )
    return response
  }
}
