export interface StudyProgram {
  id: string
  name: string
  code: string
  degree: string
  facultyId: string
  faculty?: Faculty
  _count?: { users: number }
}

export interface Faculty {
  id: string
  name: string
  code: string
  programs?: StudyProgram[]
  _count?: { programs: number }
}
