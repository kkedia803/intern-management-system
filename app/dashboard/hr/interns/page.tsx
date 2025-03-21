import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HRInternsPage } from "@/components/hr-interns-page"

export default async function HRInterns() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "HR") {
    if (session.user.role === "INTERN") {
      redirect("/dashboard/intern")
    } else if (session.user.role === "MENTOR") {
      redirect("/dashboard/mentor")
    }
  }

  // Get all interns with their mentors and projects
  const interns = await db.user.findMany({
    where: {
      role: "INTERN",
    },
    include: {
      assignedMentor: true,
      assignedProjects: true,
      submissions: {
        include: {
          project: true,
        },
      },
    },
  })

  // Get all mentors for assignment
  const mentors = await db.user.findMany({
    where: {
      role: "MENTOR",
    },
  })

  return (
    <DashboardLayout>
      <HRInternsPage interns={interns} mentors={mentors} />
    </DashboardLayout>
  )
}

