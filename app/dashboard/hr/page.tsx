import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HRDashboard } from "@/components/hr-dashboard"

export default async function HRDashboardPage() {
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

  // Get all interns
  const interns = await db.user.findMany({
    where: {
      role: "INTERN",
    },
    include: {
      assignedMentor: true,
      assignedProjects: true,
    },
  })

  // Get all mentors
  const mentors = await db.user.findMany({
    where: {
      role: "MENTOR",
    },
    include: {
      interns: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  // Get all submissions with project and intern details
  const submissions = await db.submission.findMany({
    include: {
      intern: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  return (
    <DashboardLayout>
      <HRDashboard interns={interns} mentors={mentors} submissions={submissions} />
    </DashboardLayout>
  )
}

