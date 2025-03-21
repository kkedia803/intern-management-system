import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as z from "zod"

const projectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  creatorId: z.string(),
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
    const body = projectSchema.parse(json)

    // Create project
    const project = await db.project.create({
      data: {
        title: body.title,
        description: body.description,
        creatorId: body.creatorId,
      },
    })

    return NextResponse.json({ message: "Project created successfully", project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 422 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

