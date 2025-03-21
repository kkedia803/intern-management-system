import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const submissionSchema = z.object({
  repoUrl: z.string().url(),
  liveUrl: z.string().url().optional(),
  projectId: z.string(),
  internId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "INTERN" && session.user.id !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const body = submissionSchema.parse(json)

    // Check if project exists and is assigned to the intern
    const project = await db.project.findFirst({
      where: {
        id: body.projectId,
        assignedToId: body.internId,
      },
    })

    if (!project) {
      return NextResponse.json({ message: "Project not found or not assigned to you" }, { status: 404 })
    }

    // Check if submission already exists
    const existingSubmission = await db.submission.findFirst({
      where: {
        projectId: body.projectId,
        internId: body.internId,
      },
    })

    let submission

    if (existingSubmission) {
      // Update existing submission
      submission = await db.submission.update({
        where: {
          id: existingSubmission.id,
        },
        data: {
          repoUrl: body.repoUrl,
          liveUrl: body.liveUrl,
        },
      })
    } else {
      // Create new submission
      submission = await db.submission.create({
        data: {
          repoUrl: body.repoUrl,
          liveUrl: body.liveUrl,
          projectId: body.projectId,
          internId: body.internId,
        },
      })
    }

    return NextResponse.json({ message: "Submission successful", submission }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 422 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

