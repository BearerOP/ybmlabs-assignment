import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "public", "widget", "feedback.js")
    const fileContent = await readFile(filePath, "utf-8")

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return new NextResponse("Widget not found", { status: 404 })
  }
}
