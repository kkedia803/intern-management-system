import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard-layout"
import { HRMentorsPage as HRMentorsPageComponent } from "@/components/hr-mentors-page"

export default async function HRMentorsPage() {
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

  // Get all mentors with their interns
  const mentors = await db.user.findMany({
    where: {
      role: "MENTOR",
    },
    include: {
      interns: {
        include: {
          assignedProjects: true,
          submissions: true,
        },
      },
    },
  })

  return (
    <DashboardLayout>
      <HRMentorsPageComponent mentors={mentors} />
    </DashboardLayout>
  )
}

