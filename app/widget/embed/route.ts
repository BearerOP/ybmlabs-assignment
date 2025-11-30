import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectKey = searchParams.get("key")

  // Get the server origin (where the widget is hosted)
  const origin = request.nextUrl.origin

  if (!projectKey) {
    return new NextResponse(
      `console.error("Feedback Pulse: Missing project key. Use ?key=YOUR_PROJECT_KEY");`,
      {
        status: 400,
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  }

  // Optionally validate project exists (can be removed for performance)
  try {
    const project = await prisma.project.findUnique({
      where: { projectKey },
      select: { id: true },
    })

    if (!project) {
      return new NextResponse(
        `console.error("Feedback Pulse: Invalid project key '${projectKey}'");`,
        {
          status: 404,
          headers: {
            "Content-Type": "application/javascript",
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
    }
  } catch (error) {
    // If database check fails, still allow embedding (graceful degradation)
    console.error("Failed to validate project key:", error)
  }

  // Generate the embed script with the project key
  // Set attribute BEFORE setting src to ensure it's available when script loads
  const embedScript = `(function() {
  var script = document.createElement('script');
  script.setAttribute('data-project-key', '${projectKey}');
  script.src = '${origin}/widget/feedback.js';
  script.async = true;
  script.id = 'feedback-pulse-script';
  // Ensure DOM is ready before appending
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  } else {
    document.head.appendChild(script);
  }
})();`

  return new NextResponse(embedScript, {
    headers: {
      "Content-Type": "application/javascript",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  })
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

