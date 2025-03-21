import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { InternDashboard } from "@/components/intern-dashboard"

export default async function InternDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "INTERN") {
    if (session.user.role === "MENTOR") {
      redirect("/dashboard/mentor")
    } else if (session.user.role === "HR") {
      redirect("/dashboard/hr")
    }
  }

  // Get assigned project for the intern
  const assignedProject = await db.project.findFirst({
    where: {
      assignedToId: session.user.id,
    },
  })

  // Get mentor information
  const internWithMentor = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      assignedMentor: true,
    },
  })

  // Get submission if exists
  const submission = assignedProject
    ? await db.submission.findFirst({
        where: {
          internId: session.user.id,
          projectId: assignedProject.id,
        },
      })
    : null

  return (
    <DashboardLayout>
      <InternDashboard
        project={assignedProject}
        mentor={internWithMentor?.assignedMentor}
        submission={submission}
        internId={session.user.id}
      />
    </DashboardLayout>
  )
}

