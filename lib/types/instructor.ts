export interface Instructor {
  id: string
  name: string
  email: string
  employeeId: string
  facultyId: string
  programIds: string[]
  position: "professor" | "associate_professor" | "assistant_professor" | "lecturer"
  specialization: string
  joinDate: string
  status: "active" | "inactive" | "on_leave"
  phoneNumber: string
  officeLocation: string
  officeHours: string
  bio: string
  photoUrl?: string
}
