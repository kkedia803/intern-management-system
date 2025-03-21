import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const assignProjectSchema = z.object({
  projectId: z.string(),
  internId: z.string(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "MENTOR" && session.user.role !== "HR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const json = await req.json()
    const body = assignProjectSchema.parse(json)

    // Check if project exists
    const project = await db.project.findUnique({
      where: {
        id: body.projectId,
      },
    })

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
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

    // If mentor is assigning, check if the intern is assigned to this mentor
    if (session.user.role === "MENTOR") {
      const internWithMentor = await db.user.findFirst({
        where: {
          id: body.internId,
          mentorId: session.user.id,
        },
      })

      if (!internWithMentor) {
        return NextResponse.json({ message: "You can only assign projects to your interns" }, { status: 403 })
      }
    }

    // Assign project to intern
    const updatedProject = await db.project.update({
      where: {
        id: body.projectId,
      },
      data: {
        assignedToId: body.internId,
      },
    })

    return NextResponse.json({ message: "Project assigned successfully", project: updatedProject }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 422 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

