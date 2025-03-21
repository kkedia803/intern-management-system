import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MentorInternsPage as MentorInternsPageComponent } from "@/components/mentor-interns-page"

export default async function MentorInternsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "MENTOR") {
    if (session.user.role === "INTERN") {
      redirect("/dashboard/intern")
    } else if (session.user.role === "HR") {
      redirect("/dashboard/hr")
    }
  }

  // Get assigned interns with their projects and submissions
  const interns = await db.user.findMany({
    where: {
      mentorId: session.user.id,
      role: "INTERN",
    },
    include: {
      assignedProjects: true,
      submissions: {
        include: {
          project: true,
        },
      },
    },
  })

  // Get projects created by this mentor
  const projects = await db.project.findMany({
    where: {
      creatorId: session.user.id,
      assignedToId: null, // Only get unassigned projects
    },
  })

  return (
    <DashboardLayout>
      <MentorInternsPageComponent interns={interns} projects={projects} mentorId={session.user.id} />
    </DashboardLayout>
  )
}

