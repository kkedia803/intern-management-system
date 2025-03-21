import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import * as z from "zod"

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["INTERN", "MENTOR", "HR"]),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = userSchema.parse(json)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: body.email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(body.password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
    })

    // Remove password from response
    const { password, ...result } = user

    return NextResponse.json({ message: "User created successfully", user: result }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data", errors: error.errors }, { status: 422 })
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

