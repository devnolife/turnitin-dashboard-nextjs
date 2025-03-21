"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useFacultyStore } from "@/lib/store/faculty-store"
import { PageTransition, FadeIn } from "@/components/ui/motion"
import { format } from "date-fns"

// Form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  employeeId: z.string().min(2, {
    message: "Employee ID is required.",
  }),
  facultyId: z.string({
    required_error: "Please select a faculty.",
  }),
  programIds: z.array(z.string()).min(1, {
    message: "Please select at least one program.",
  }),
  position: z.enum(["professor", "associate_professor", "assistant_professor", "lecturer"], {
    required_error: "Please select a position.",
  }),
  specialization: z.string().min(3, {
    message: "Specialization is required.",
  }),
  joinDate: z.date({
    required_error: "Please select a join date.",
  }),
  status: z.enum(["active", "inactive", "on_leave"], {
    required_error: "Please select a status.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  officeLocation: z.string().min(3, {
    message: "Office location is required.",
  }),
  officeHours: z.string().min(3, {
    message: "Office hours are required.",
  }),
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }),
})

export function AddInstructorPage() {
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { faculties } = useFacultyStore()

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      employeeId: "",
      position: "lecturer",
      specialization: "",
      joinDate: new Date(),
      status: "active",
      phoneNumber: "",
      officeLocation: "",
      officeHours: "",
      bio: "",
      programIds: [],
    },
  })

  // Get available programs for selected faculty
  const availablePrograms = selectedFaculty ? faculties.find((f) => f.id === selectedFaculty)?.programs || [] : []

  // Handle faculty change
  const handleFacultyChange = (value: string) => {
    setSelectedFaculty(value)
    form.setValue("facultyId", value)
    form.setValue("programIds", [])
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // In a real app, this would be an API call
      console.log("Form values:", values)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Instructor added successfully",
        description: "The new instructor has been added to the system.",
      })

      // Redirect to instructors page
      router.push("/dashboard/admin/instructors")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add instructor. Please try again.",
      })
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/admin/instructors")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Add Instructor</h1>
        </div>

        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Instructor Information</CardTitle>
              <CardDescription>Add a new instructor to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john.smith@university.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee ID</FormLabel>
                          <FormControl>
                            <Input placeholder="I12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+62812345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professor">Professor</SelectItem>
                              <SelectItem value="associate_professor">Associate Professor</SelectItem>
                              <SelectItem value="assistant_professor">Assistant Professor</SelectItem>
                              <SelectItem value="lecturer">Lecturer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="on_leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facultyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Faculty</FormLabel>
                          <Select onValueChange={handleFacultyChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select faculty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {faculties.map((faculty) => (
                                <SelectItem key={faculty.id} value={faculty.id}>
                                  {faculty.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="programIds"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Programs</FormLabel>
                            <FormDescription>Select the programs this instructor will supervise</FormDescription>
                          </div>
                          <div className="space-y-2">
                            {selectedFaculty ? (
                              availablePrograms.length > 0 ? (
                                availablePrograms.map((program) => (
                                  <FormField
                                    key={program.id}
                                    control={form.control}
                                    name="programIds"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={program.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(program.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, program.id])
                                                  : field.onChange(field.value?.filter((value) => value !== program.id))
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">{program.name}</FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground">No programs available for this faculty</p>
                              )
                            ) : (
                              <p className="text-sm text-muted-foreground">Please select a faculty first</p>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="Artificial Intelligence" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="joinDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Join Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant={"outline"} className="w-full pl-3 text-left font-normal">
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => field.onChange(date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="officeLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Building A, Room 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="officeHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Office Hours</FormLabel>
                          <FormControl>
                            <Input placeholder="Monday & Wednesday, 10:00 - 12:00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the instructor's background and expertise"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push("/dashboard/admin/instructors")}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Save Instructor
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  )
}

