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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { User, Star } from "lucide-react"

const assignMentorSchema = z.object({
  mentorId: z.string({
    required_error: "Please select a mentor.",
  }),
  internId: z.string({
    required_error: "Please select an intern.",
  }),
})

export function HRInternsPage({ interns, mentors }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedIntern, setSelectedIntern] = useState(null)

  const assignForm = useForm({
    resolver: zodResolver(assignMentorSchema),
    defaultValues: {
      mentorId: "",
      internId: "",
    },
  })

  async function onAssignMentor(values) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/mentors/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to assign mentor")
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Interns Management</h2>
        <Button onClick={() => setIsAssignDialogOpen(true)} disabled={mentors.length === 0}>
          Assign Mentor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Interns</CardTitle>
          <CardDescription>Manage all interns and their assignments</CardDescription>
        </CardHeader>
        <CardContent>
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
                      {intern.assignedMentor ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Has Mentor
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          No Mentor
                        </Badge>
                      )}
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
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Mentor Information</h4>
                        {intern.assignedMentor ? (
                          <div className="flex items-center gap-2 p-2 border rounded-md">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{intern.assignedMentor.name}</p>
                              <p className="text-sm text-muted-foreground">{intern.assignedMentor.email}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2 border rounded-md">
                            <p className="text-muted-foreground">No mentor assigned</p>
                            <Button size="sm" onClick={() => openAssignDialog(intern)}>
                              Assign Mentor
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Project Information</h4>
                        {intern.assignedProjects.length > 0 ? (
                          <div className="p-2 border rounded-md">
                            <p className="font-medium">{intern.assignedProjects[0].title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {intern.assignedProjects[0].description}
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 border rounded-md">
                            <p className="text-muted-foreground">No project assigned</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Submissions</h4>
                      {intern.submissions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Project</TableHead>
                              <TableHead>Repository</TableHead>
                              <TableHead>Live URL</TableHead>
                              <TableHead>Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {intern.submissions.map((submission) => (
                              <TableRow key={submission.id}>
                                <TableCell>{submission.project.title}</TableCell>
                                <TableCell>
                                  <a
                                    href={submission.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                  >
                                    Repository
                                  </a>
                                </TableCell>
                                <TableCell>
                                  {submission.liveUrl ? (
                                    <a
                                      href={submission.liveUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      Live Demo
                                    </a>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {submission.grade !== null ? (
                                    <div className="flex items-center gap-1">
                                      <span>{submission.grade}/10</span>
                                      {submission.grade >= 8 && <Star className="h-4 w-4 text-yellow-500" />}
                                    </div>
                                  ) : (
                                    "Not graded"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground p-2 border rounded-md">No submissions yet</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      {intern.assignedMentor ? (
                        <Button variant="outline" size="sm" onClick={() => openAssignDialog(intern)}>
                          Change Mentor
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => openAssignDialog(intern)}>
                          Assign Mentor
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

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIntern ? `Assign Mentor to ${selectedIntern.name}` : "Assign Mentor to Intern"}
            </DialogTitle>
            <DialogDescription>Select a mentor to assign to this intern.</DialogDescription>
          </DialogHeader>
          <Form {...assignForm}>
            <form onSubmit={assignForm.handleSubmit(onAssignMentor)} className="space-y-4">
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
              )}
              <FormField
                control={assignForm.control}
                name="mentorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mentor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mentors.map((mentor) => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
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
                  {isLoading ? "Assigning..." : "Assign Mentor"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

