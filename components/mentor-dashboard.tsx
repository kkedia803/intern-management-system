"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const projectFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

const assignProjectSchema = z.object({
  projectId: z.string({
    required_error: "Please select a project.",
  }),
  internId: z.string({
    required_error: "Please select an intern.",
  }),
})

export function MentorDashboard({ interns, projects, mentorId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)

  const projectForm = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const assignForm = useForm({
    resolver: zodResolver(assignProjectSchema),
    defaultValues: {
      projectId: "",
      internId: "",
    },
  })

  async function onCreateProject(values) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          creatorId: mentorId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create project")
      }

      setSuccess(true)
      projectForm.reset()

      // Refresh the page to show the new project
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function onAssignProject(values) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/projects/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to assign project")
      }

      setIsAssignDialogOpen(false)
      assignForm.reset()

      // Refresh the page to show the updated assignments
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter out projects that are already assigned
  const availableProjects = projects.filter((project) => !project.assignedToId)

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Interns</CardTitle>
            <CardDescription>Interns assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {interns.length > 0 ? (
              <div className="space-y-4">
                {interns.map((intern) => (
                  <div key={intern.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{intern.name}</p>
                        <p className="text-sm text-muted-foreground">{intern.email}</p>
                      </div>
                    </div>
                    {intern.assignedProjects.length > 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Project Assigned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        No Project
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No interns assigned yet</p>
            )}
          </CardContent>
          <CardFooter>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={interns.length === 0 || availableProjects.length === 0}>Assign Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Project to Intern</DialogTitle>
                  <DialogDescription>Select an intern and a project to assign.</DialogDescription>
                </DialogHeader>
                <Form {...assignForm}>
                  <form onSubmit={assignForm.handleSubmit(onAssignProject)} className="space-y-4">
                    <FormField
                      control={assignForm.control}
                      name="internId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intern</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an intern" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {interns.map((intern) => (
                                <SelectItem key={intern.id} value={intern.id}>
                                  {intern.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assignForm.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableProjects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Assigning..." : "Assign Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Create a new project for interns</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...projectForm}>
              <form onSubmit={projectForm.handleSubmit(onCreateProject)} className="space-y-4">
                <FormField
                  control={projectForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E-commerce Website" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Build a full-stack e-commerce website with Next.js..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">Project created successfully!</p>}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>Projects you have created</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const assignedIntern = interns.find((intern) =>
                    intern.assignedProjects.some((p) => p.id === project.id),
                  )

                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                      <TableCell>
                        {project.assignedToId ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Unassigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{assignedIntern ? assignedIntern.name : "Not assigned"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No projects created yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

