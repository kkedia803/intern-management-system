import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const gradeSchema = z.object({
  grade: z.number().min(0).max(10),
  feedback: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "HR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const submissionId = params.id

    // Check if submission exists
    const submission = await db.submission.findUnique({
      where: {
        id: submissionId,
      },
    })

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 })
    }

    const json = await req.json()
    const body = gradeSchema.parse(json)

    // Update submission with grade and feedback
    const updatedSubmission = await db.submission.update({
      where: {
        id: submissionId,
      },
      data: {
        grade: body.grade,
        feedback: body.feedback,
      },
    })

    return NextResponse.json(
      { message: "Submission graded successfully", submission: updatedSubmission },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 422 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

