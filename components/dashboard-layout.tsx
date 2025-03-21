"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { LayoutDashboard, Users, FileCode, LogOut, Menu, X } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (!session) {
    router.push("/login")
    return null
  }

  const role = session.user.role

  const navigation = [
    {
      name: "Dashboard",
      href: `/dashboard/${role.toLowerCase()}`,
      icon: LayoutDashboard,
      current: true,
    },
  ]

  if (role === "MENTOR") {
    navigation.push({
      name: "Interns",
      href: "/dashboard/mentor/interns",
      icon: Users,
      current: false,
    })
  }

  if (role === "HR") {
    navigation.push(
      {
        name: "Interns",
        href: "/dashboard/hr/interns",
        icon: Users,
        current: false,
      },
      {
        name: "Mentors",
        href: "/dashboard/hr/mentors",
        icon: Users,
        current: false,
      },
      {
        name: "Projects",
        href: "/dashboard/hr/projects",
        icon: FileCode,
        current: false,
      },
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="fixed inset-0 z-40 flex md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-30 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex h-full w-full max-w-xs flex-1 flex-col bg-white pt-5 dark:bg-gray-800">
          <div className="flex flex-shrink-0 items-center px-4">
            <h2 className="text-lg font-semibold">Intern Management</h2>
          </div>
          <div className="mt-5 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
            <Button
              variant="ghost"
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => signOut()}
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5">
            <div className="flex flex-shrink-0 items-center px-4">
              <h2 className="text-lg font-semibold">Intern Management</h2>
            </div>
            <nav className="mt-5 flex-1 space-y-1 bg-white px-2 dark:bg-gray-800">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
            <Button
              variant="ghost"
              className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => signOut()}
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow dark:bg-gray-800">
          <div className="px-4 py-6 sm:px-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  )
}

