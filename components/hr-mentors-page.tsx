"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { User, CheckCircle, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function HRMentorsPage({ mentors }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Mentors Management</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Mentors</CardTitle>
          <CardDescription>View all mentors and their assigned interns</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {mentors.map((mentor) => (
              <AccordionItem key={mentor.id} value={mentor.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{mentor.name}</p>
                        <p className="text-sm text-muted-foreground">{mentor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {mentor.interns.length} {mentor.interns.length === 1 ? "Intern" : "Interns"}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Mentor Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{mentor.interns.length}</div>
                              <p className="text-sm text-muted-foreground">Assigned Interns</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {mentor.interns.filter((intern) => intern.assignedProjects.length > 0).length}
                              </div>
                              <p className="text-sm text-muted-foreground">Interns with Projects</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {mentor.interns.filter((intern) => intern.submissions.length > 0).length}
                              </div>
                              <p className="text-sm text-muted-foreground">Interns with Submissions</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {mentor.interns.length > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Project Assignment Rate</span>
                            <span className="text-sm font-medium">
                              {Math.round(
                                (mentor.interns.filter((intern) => intern.assignedProjects.length > 0).length /
                                  mentor.interns.length) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (mentor.interns.filter((intern) => intern.assignedProjects.length > 0).length /
                                mentor.interns.length) *
                              100
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Assigned Interns</h4>
                      {mentor.interns.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Project</TableHead>
                              <TableHead>Submission</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mentor.interns.map((intern) => (
                              <TableRow key={intern.id}>
                                <TableCell className="font-medium">{intern.name}</TableCell>
                                <TableCell>{intern.email}</TableCell>
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
                                <TableCell>
                                  {intern.submissions.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Submitted
                                      {intern.submissions[0].grade !== null && (
                                        <span className="ml-1">({intern.submissions[0].grade}/10)</span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <XCircle className="h-4 w-4 text-red-500" />
                                      Not Submitted
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground p-2 border rounded-md">No interns assigned yet</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

