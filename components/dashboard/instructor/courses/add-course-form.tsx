"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCourseStore } from "@/lib/store/course-store"
import { useToast } from "@/components/ui/use-toast"

export function AddCourseForm() {
  const router = useRouter()
  const { addCourse } = useCourseStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    credits: "3",
    semester: "Fall 2023",
    department: "Computer Science",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newCourse = {
        id: Math.floor(Math.random() * 10000).toString(),
        ...formData,
        instructorId: "current-user-id", // This would come from auth context
        enrolledStudents: 0,
        createdAt: new Date().toISOString(),
      }

      addCourse(newCourse)

      toast({
        title: "Course created successfully",
        description: `${formData.title} has been added to your courses.`,
        variant: "default",
      })

      router.push("/dashboard/instructor/courses")
    } catch (error) {
      toast({
        title: "Error creating course",
        description: "There was an error creating your course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">Add a new course to your teaching portfolio</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Enter the details for your new course. All fields are required.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Introduction to Computer Science"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="CS101"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A comprehensive introduction to the fundamental concepts of computer science..."
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Select value={formData.credits} onValueChange={(value) => handleSelectChange("credits", value)}>
                  <SelectTrigger id="credits">
                    <SelectValue placeholder="Select credits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Credit</SelectItem>
                    <SelectItem value="2">2 Credits</SelectItem>
                    <SelectItem value="3">3 Credits</SelectItem>
                    <SelectItem value="4">4 Credits</SelectItem>
                    <SelectItem value="5">5 Credits</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => handleSelectChange("semester", value)}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall 2023">Fall 2023</SelectItem>
                    <SelectItem value="Spring 2024">Spring 2024</SelectItem>
                    <SelectItem value="Summer 2024">Summer 2024</SelectItem>
                    <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/instructor/courses")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Course"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

