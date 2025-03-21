import { RegisterForm } from "@/components/register-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === "INTERN") {
      redirect("/dashboard/intern")
    } else if (session.user.role === "MENTOR") {
      redirect("/dashboard/mentor")
    } else if (session.user.role === "HR") {
      redirect("/dashboard/hr")
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">Enter your details to create an account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}

