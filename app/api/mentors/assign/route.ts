import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const assignMentorSchema = z.object({
  mentorId: z.string(),
  internId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "HR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const body = assignMentorSchema.parse(json)

    // Check if mentor exists and has the MENTOR role
    const mentor = await db.user.findFirst({
      where: {
        id: body.mentorId,
        role: "MENTOR",
      },
    })

    if (!mentor) {
      return NextResponse.json({ message: "Mentor not found" }, { status: 404 })
    }

    // Check if intern exists and has the INTERN role
    const intern = await db.user.findFirst({
      where: {
        id: body.internId,
        role: "INTERN",
      },
    })

    if (!intern) {
      return NextResponse.json({ message: "Intern not found" }, { status: 404 })
    }

    // Assign mentor to intern
    const updatedIntern = await db.user.update({
      where: {
        id: body.internId,
      },
      data: {
        mentorId: body.mentorId,
      },
    })

    return NextResponse.json({ message: "Mentor assigned successfully", intern: updatedIntern }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 422 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

