"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

const formSchema = z.object({
  repoUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
  liveUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional(),
})

export function InternDashboard({ project, mentor, submission, internId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: submission?.repoUrl || "",
      liveUrl: submission?.liveUrl || "",
    },
  })

  async function onSubmit(values) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          projectId: project.id,
          internId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to submit project")
      }

      setSuccess(true)
      form.reset({
        repoUrl: values.repoUrl,
        liveUrl: values.liveUrl,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Mentor</CardTitle>
            <CardDescription>Your assigned mentor details</CardDescription>
          </CardHeader>
          <CardContent>
            {mentor ? (
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-medium">{mentor.name}</p>
                  <p className="text-sm text-muted-foreground">{mentor.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No mentor assigned yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Your current project status</CardDescription>
          </CardHeader>
          <CardContent>
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Submission Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Submitted
                  </Badge>
                </div>
                {submission.grade && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade</span>
                    <Badge>{submission.grade}/10</Badge>
                  </div>
                )}
                {submission.feedback && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Feedback</span>
                    <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                  </div>
                )}
              </div>
            ) : project ? (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                Not Submitted
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                No Project Assigned
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {project && (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Project</CardTitle>
            <CardDescription>Details of your assigned project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">{project.title}</h3>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="repoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repository URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="liveUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Live Project URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-project.vercel.app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-500">Project submitted successfully!</p>}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : submission ? "Update Submission" : "Submit Project"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

