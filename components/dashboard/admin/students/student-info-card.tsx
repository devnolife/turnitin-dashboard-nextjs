"use client"

import {
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Clock,
  Eye,
  User,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { type Student, type ExamStage } from "@/lib/store/student-store"

export interface InstructorInfo {
  id: string
  name: string
  email: string
}

export interface StudentInfoCardProps {
  student: Student
  instructor: InstructorInfo | null
  instructors: Array<{ id: string; name: string; status: string }>
  instructorDialogOpen: boolean
  onInstructorDialogOpenChange: (open: boolean) => void
  selectedInstructorId: string
  onSelectedInstructorIdChange: (value: string) => void
  onAssignInstructor: () => void
  onRemoveInstructor: () => void
  onViewInstructor: (instructorId: string) => void
  formatExamStage: (stage: ExamStage) => string
  getExamStageBadgeVariant: (stage: ExamStage) => string
  getFacultyName: (facultyId: string) => string
  getProgramName: (facultyId: string, programId: string) => string
}

export function StudentInfoCard({
  student,
  instructor,
  instructors,
  instructorDialogOpen,
  onInstructorDialogOpenChange,
  selectedInstructorId,
  onSelectedInstructorIdChange,
  onAssignInstructor,
  onRemoveInstructor,
  onViewInstructor,
  formatExamStage,
  getExamStageBadgeVariant,
  getFacultyName,
  getProgramName,
}: StudentInfoCardProps) {
  const activeInstructors = instructors.filter((i) => i.status === "active")

  const instructorSelectDialog = (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Tetapkan Instruktur</DialogTitle>
        <DialogDescription>Pilih instruktur untuk ditugaskan ke mahasiswa ini.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="instructor">Instruktur</Label>
          <Select value={selectedInstructorId} onValueChange={onSelectedInstructorIdChange}>
            <SelectTrigger id="instructor">
              <SelectValue placeholder="Pilih instruktur" />
            </SelectTrigger>
            <SelectContent>
              {activeInstructors.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onInstructorDialogOpenChange(false)}>
          Batal
        </Button>
        <Button onClick={onAssignInstructor}>Tetapkan</Button>
      </DialogFooter>
    </DialogContent>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-center">{student.name}</CardTitle>
          <CardDescription className="text-center">{student.studentId}</CardDescription>
          <Badge variant={getExamStageBadgeVariant(student.examStage) as any} className="mt-2">
            {formatExamStage(student.examStage)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{student.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{student.whatsappNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>{getFacultyName(student.facultyId)}</span>
          </div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>{getProgramName(student.facultyId, student.programId)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Terakhir aktif: {student.lastActive}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Instruktur Ditugaskan</h3>

              {instructor ? (
                <div className="flex gap-2">
                  <Dialog open={instructorDialogOpen} onOpenChange={onInstructorDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="mr-2 h-3 w-3" />
                        Ubah
                      </Button>
                    </DialogTrigger>
                    {instructorSelectDialog}
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={onRemoveInstructor}>
                    <UserMinus className="mr-2 h-3 w-3" />
                    Hapus
                  </Button>
                </div>
              ) : (
                <Dialog open={instructorDialogOpen} onOpenChange={onInstructorDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="mr-2 h-3 w-3" />
                      Tetapkan
                    </Button>
                  </DialogTrigger>
                  {instructorSelectDialog}
                </Dialog>
              )}
            </div>

            {instructor ? (
              <div className="flex items-center gap-2 rounded-md border p-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {instructor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="font-medium">{instructor.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{instructor.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewInstructor(instructor.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-md border p-3 text-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Belum ada instruktur ditugaskan</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Badge
          variant={
            student.status === "active"
              ? "success"
              : student.status === "inactive"
                ? "secondary"
                : "destructive"
          }
        >
          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </Badge>
      </CardFooter>
    </Card>
  )
}
