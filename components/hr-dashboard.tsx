"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Star } from "lucide-react"

const assignMentorSchema = z.object({
  mentorId: z.string({
    required_error: "Please select a mentor.",
  }),
  internId: z.string({
    required_error: "Please select an intern.",
  }),
})

const gradeSubmissionSchema = z.object({
  grade: z.coerce.number().min(0).max(10),
  feedback: z.string().optional(),
})

export function HRDashboard({ interns, mentors, submissions }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false)

  const assignForm = useForm({
    resolver: zodResolver(assignMentorSchema),
    defaultValues: {
      mentorId: "",
      internId: "",
    },
  })

  const gradeForm = useForm({
    resolver: zodResolver(gradeSubmissionSchema),
    defaultValues: {
      grade: 0,
      feedback: "",
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

  async function onGradeSubmission(values) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/submissions/${selectedSubmission.id}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to grade submission")
      }

      setIsGradeDialogOpen(false)
      gradeForm.reset()

      // Refresh the page to show the updated grades
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const openGradeDialog = (submission) => {
    setSelectedSubmission(submission)
    gradeForm.reset({
      grade: submission.grade || 0,
      feedback: submission.feedback || "",
    })
    setIsGradeDialogOpen(true)
  }

  // Filter interns without mentors
  const internsWithoutMentor = interns.filter((intern) => !intern.mentorId)

  return (
    <Tabs defaultValue="interns" className="space-y-6">
      <TabsList>
        <TabsTrigger value="interns">Interns</TabsTrigger>
        <TabsTrigger value="mentors">Mentors</TabsTrigger>
        <TabsTrigger value="submissions">Submissions</TabsTrigger>
      </TabsList>

      <TabsContent value="interns" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Interns Management</h2>
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={internsWithoutMentor.length === 0 || mentors.length === 0}>Assign Mentor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Mentor to Intern</DialogTitle>
                <DialogDescription>Select an intern and a mentor to assign.</DialogDescription>
              </DialogHeader>
              <Form {...assignForm}>
                <form onSubmit={assignForm.handleSubmit(onAssignMentor)} className="space-y-4">
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
                            {internsWithoutMentor.map((intern) => (
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interns.map((intern) => (
                  <TableRow key={intern.id}>
                    <TableCell className="font-medium">{intern.name}</TableCell>
                    <TableCell>{intern.email}</TableCell>
                    <TableCell>
                      {intern.assignedMentor ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {intern.assignedMentor.name}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Not Assigned
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {intern.assignedProjects.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {intern.assignedProjects[0].title}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          No Project
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="mentors" className="space-y-4">
        <h2 className="text-xl font-semibold">Mentors Management</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Interns</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">{mentor.name}</TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell>
                      {mentor.interns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {mentor.interns.map((intern) => (
                            <Badge key={intern.id} variant="outline">
                              {intern.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "No interns assigned"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="submissions" className="space-y-4">
        <h2 className="text-xl font-semibold">Project Submissions</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Repository</TableHead>
                  <TableHead>Live URL</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.intern.name}</TableCell>
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
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openGradeDialog(submission)}>
                        {submission.grade !== null ? "Update Grade" : "Grade"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
              <DialogDescription>
                {selectedSubmission && (
                  <>
                    Project: <strong>{selectedSubmission.project.title}</strong> by{" "}
                    <strong>{selectedSubmission.intern.name}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <Form {...gradeForm}>
              <form onSubmit={gradeForm.handleSubmit(onGradeSubmission)} className="space-y-4">
                <FormField
                  control={gradeForm.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={gradeForm.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedback (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide feedback on the submission..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Grade"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </TabsContent>
    </Tabs>
  )
}

