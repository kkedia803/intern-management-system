"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { User, FileCode, Plus } from "lucide-react"

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

export function HRProjectsPage({ projects, interns, hrId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

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
          creatorId: hrId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to create project")
      }

      setSuccess(true)
      projectForm.reset()
      setIsCreateDialogOpen(false)

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

  const openAssignDialog = (project) => {
    setSelectedProject(project)
    assignForm.setValue("projectId", project.id)
    setIsAssignDialogOpen(true)
  }

  // Filter out interns who already have projects assigned
  const availableInterns = interns.filter((intern) => intern.assignedProjects.length === 0)

  // Filter out projects that are already assigned
  const unassignedProjects = projects.filter((project) => !project.assignedToId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Projects Management</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>View and manage all projects in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {projects.map((project) => (
              <AccordionItem key={project.id} value={project.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FileCode className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">Created by {project.creator.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.assignedTo ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Unassigned
                        </Badge>
                      )}
                      {project.submissions.length > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Submitted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Not Submitted
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Project Details</h4>
                      <div className="p-3 border rounded-md">
                        <p className="text-sm whitespace-pre-line">{project.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Assignment Information</h4>
                        {project.assignedTo ? (
                          <div className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{project.assignedTo.name}</p>
                              <p className="text-sm text-muted-foreground">{project.assignedTo.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 border rounded-md">
                            <p className="text-muted-foreground">Not assigned to any intern</p>
                            <Button size="sm" onClick={() => openAssignDialog(project)}>
                              Assign
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Submission Status</h4>
                        {project.submissions.length > 0 ? (
                          <div className="p-2 border rounded-md">
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">Repository:</span>
                              <a
                                href={project.submissions[0].repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Repository
                              </a>
                            </div>
                            {project.submissions[0].liveUrl && (
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">Live Demo:</span>
                                <a
                                  href={project.submissions[0].liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  View Demo
                                </a>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="font-medium">Grade:</span>
                              <span>
                                {project.submissions[0].grade !== null
                                  ? `${project.submissions[0].grade}/10`
                                  : "Not graded yet"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground p-2 border rounded-md">No submission yet</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      {!project.assignedTo && (
                        <Button size="sm" onClick={() => openAssignDialog(project)}>
                          Assign to Intern
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Create a new project that can be assigned to interns.</DialogDescription>
          </DialogHeader>
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
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign Project Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProject ? `Assign ${selectedProject.title}` : "Assign Project"}</DialogTitle>
            <DialogDescription>Select an intern to assign this project to.</DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignProject)} className="space-y-4">
              {!selectedProject && (
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
                          {unassignedProjects.map((project) => (
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
              )}
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
                        {availableInterns.map((intern) => (
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
    </div>
  )
}

