"use client"

import {
  Upload,
  FileText,
  Plus,
  Download,
  Edit,
  MoreHorizontal,
  Trash,
  CheckCircle,
  Eye,
  FileCheck,
  Users,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type {
  Course,
  Material,
  Assignment,
  Student,
  NewMaterialForm,
  NewAssignmentForm,
} from "./course-detail-types"

interface CourseDetailTabsProps {
  course: Course
  materials: Material[]
  assignments: Assignment[]
  students: Student[]
  newMaterialDialogOpen: boolean
  onNewMaterialDialogOpenChange: (open: boolean) => void
  newMaterial: NewMaterialForm
  onNewMaterialChange: (material: NewMaterialForm) => void
  onUploadMaterial: () => void
  onDeleteMaterial: (id: string) => void
  newAssignmentDialogOpen: boolean
  onNewAssignmentDialogOpenChange: (open: boolean) => void
  newAssignment: NewAssignmentForm
  onNewAssignmentChange: (assignment: NewAssignmentForm) => void
  onCreateAssignment: () => void
  onDeleteAssignment: (id: string) => void
  onPublishAssignment: (id: string) => void
  onViewStudent: (id: string) => void
  onViewAssignment: (assignmentId: string) => void
  onManageStudents: () => void
}

export function CourseDetailTabs({
  course,
  materials,
  assignments,
  students,
  newMaterialDialogOpen,
  onNewMaterialDialogOpenChange,
  newMaterial,
  onNewMaterialChange,
  onUploadMaterial,
  onDeleteMaterial,
  newAssignmentDialogOpen,
  onNewAssignmentDialogOpenChange,
  newAssignment,
  onNewAssignmentChange,
  onCreateAssignment,
  onDeleteAssignment,
  onPublishAssignment,
  onViewStudent,
  onViewAssignment,
  onManageStudents,
}: CourseDetailTabsProps) {
  return (
    <Tabs defaultValue="materials" className="space-y-4">
      <TabsList>
        <TabsTrigger value="materials">Materials</TabsTrigger>
        <TabsTrigger value="assignments">Assignments</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
      </TabsList>

      {/* Materials Tab */}
      <TabsContent value="materials" className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Course Materials</h2>
          <Dialog open={newMaterialDialogOpen} onOpenChange={onNewMaterialDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Upload Course Material</DialogTitle>
                <DialogDescription>
                  Add new material to your course. Students will be able to access this material.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Lecture Slides Week 1"
                    value={newMaterial.title}
                    onChange={(e) => onNewMaterialChange({ ...newMaterial, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newMaterial.type}
                    onValueChange={(value) => onNewMaterialChange({ ...newMaterial, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select material type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the material"
                    value={newMaterial.description}
                    onChange={(e) => onNewMaterialChange({ ...newMaterial, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onNewMaterialChange({ ...newMaterial, file: e.target.files[0] })
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onNewMaterialDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={onUploadMaterial}>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="font-medium">{material.title}</div>
                      <div className="text-sm text-muted-foreground">{material.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{material.uploadedAt}</TableCell>
                    <TableCell>{material.fileSize || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDeleteMaterial(material.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/60" />
                      <h3 className="mt-2 text-lg font-medium">No Materials</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t uploaded any materials to this course yet.
                      </p>
                      <Button className="mt-4" onClick={() => onNewMaterialDialogOpenChange(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Material
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Assignments Tab */}
      <TabsContent value="assignments" className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Assignments</h2>
          <Dialog open={newAssignmentDialogOpen} onOpenChange={onNewAssignmentDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Create a new assignment for your students.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Midterm Project"
                    value={newAssignment.title}
                    onChange={(e) => onNewAssignmentChange({ ...newAssignment, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Assignment instructions and requirements"
                    value={newAssignment.description}
                    onChange={(e) => onNewAssignmentChange({ ...newAssignment, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="text"
                      placeholder="e.g. May 15, 2025"
                      value={newAssignment.dueDate}
                      onChange={(e) => onNewAssignmentChange({ ...newAssignment, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={newAssignment.maxScore}
                      onChange={(e) =>
                        onNewAssignmentChange({ ...newAssignment, maxScore: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onNewAssignmentDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={onCreateAssignment}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{assignment.description}</div>
                    </TableCell>
                    <TableCell>{assignment.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assignment.status === "published"
                            ? "default"
                            : assignment.status === "draft"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignment.submissionCount} / {course.studentCount}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewAssignment(assignment.id)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        {assignment.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPublishAssignment(assignment.id)}
                          >
                            <FileCheck className="mr-1 h-3 w-3" />
                            Publish
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Grade
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDeleteAssignment(assignment.id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/60" />
                      <h3 className="mt-2 text-lg font-medium">No Assignments</h3>
                      <p className="text-sm text-muted-foreground">
                        You haven&apos;t created any assignments for this course yet.
                      </p>
                      <Button className="mt-4" onClick={() => onNewAssignmentDialogOpenChange(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      {/* Students Tab */}
      <TabsContent value="students" className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold">Enrolled Students</h2>
          <Button onClick={onManageStudents}>
            <Users className="mr-2 h-4 w-4" />
            Manage Students
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.lastActive}</TableCell>
                    <TableCell>
                      {student.submissionCount} / {assignments.length}
                    </TableCell>
                    <TableCell>{student.averageScore !== null ? `${student.averageScore}%` : "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onViewStudent(student.id)}>
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.href = `mailto:${student.email}`)}
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground/60" />
                      <h3 className="mt-2 text-lg font-medium">No Students</h3>
                      <p className="text-sm text-muted-foreground">
                        There are no students enrolled in this course yet.
                      </p>
                      <Button className="mt-4" onClick={onManageStudents}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Students
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}
