import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HRProjectsPage as HRProjectsPageComponent } from "@/components/hr-projects-page"

export default async function HRProjectsPage() {
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

  // Get all projects with creator, assigned intern, and submissions
  const projects = await db.project.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      submissions: {
        include: {
          intern: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

  // Get all interns for assignment
  const interns = await db.user.findMany({
    where: {
      role: "INTERN",
    },
    include: {
      assignedProjects: true,
    },
  })

  return (
    <DashboardLayout>
      <HRProjectsPageComponent projects={projects} interns={interns} hrId={session.user.id} />
    </DashboardLayout>
  )
}

