"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User } from "lucide-react"

const assignProjectSchema = z.object({
  projectId: z.string({
    required_error: "Please select a project.",
  }),
  internId: z.string({
    required_error: "Please select an intern.",
  }),
})

export function MentorInternsPage({ interns, projects, mentorId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedIntern, setSelectedIntern] = useState(null)

  const assignForm = useForm({
    resolver: zodResolver(assignProjectSchema),
    defaultValues: {
      projectId: "",
      internId: "",
    },
  })

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

  const openAssignDialog = (intern) => {
    setSelectedIntern(intern)
    assignForm.setValue("internId", intern.id)
    setIsAssignDialogOpen(true)
  }

  // Filter interns without projects
  const internsWithoutProjects = interns.filter((intern) => intern.assignedProjects.length === 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your Interns</h2>
        <Button
          onClick={() => setIsAssignDialogOpen(true)}
          disabled={internsWithoutProjects.length === 0 || projects.length === 0}
        >
          Assign Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Interns</CardTitle>
          <CardDescription>Manage your assigned interns and their projects</CardDescription>
        </CardHeader>
        <CardContent>
          {interns.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {interns.map((intern) => (
                <AccordionItem key={intern.id} value={intern.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{intern.name}</p>
                          <p className="text-sm text-muted-foreground">{intern.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {intern.assignedProjects.length > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Project Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            No Project
                          </Badge>
                        )}
                        {intern.submissions.length > 0 ? (
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
                      {intern.assignedProjects.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Assigned Project</h4>
                          <div className="p-3 border rounded-md">
                            <h5 className="font-medium">{intern.assignedProjects[0].title}</h5>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                              {intern.assignedProjects[0].description}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border rounded-md">
                          <p className="text-muted-foreground">No project assigned yet</p>
                          <Button size="sm" onClick={() => openAssignDialog(intern)} disabled={projects.length === 0}>
                            Assign Project
                          </Button>
                        </div>
                      )}

                      {intern.submissions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Project Submission</h4>
                          <div className="p-3 border rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Repository URL:</p>
                                <a
                                  href={intern.submissions[0].repoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 hover:underline break-all"
                                >
                                  {intern.submissions[0].repoUrl}
                                </a>
                              </div>
                              {intern.submissions[0].liveUrl && (
                                <div>
                                  <p className="text-sm font-medium">Live URL:</p>
                                  <a
                                    href={intern.submissions[0].liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline break-all"
                                  >
                                    {intern.submissions[0].liveUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                            {intern.submissions[0].grade !== null && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Grade: {intern.submissions[0].grade}/10</p>
                                {intern.submissions[0].feedback && (
                                  <div className="mt-1">
                                    <p className="text-sm font-medium">Feedback:</p>
                                    <p className="text-sm text-muted-foreground">{intern.submissions[0].feedback}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">No interns have been assigned to you yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIntern ? `Assign Project to ${selectedIntern.name}` : "Assign Project to Intern"}
            </DialogTitle>
            <DialogDescription>Select a project to assign to this intern.</DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignProject)} className="space-y-4">
              {!selectedIntern && (
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
                          {internsWithoutProjects.map((intern) => (
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
              )}
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
                        {projects.map((project) => (
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
    </div>
  )
}

