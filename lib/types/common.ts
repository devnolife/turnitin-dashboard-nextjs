export interface StudyProgram {
  id: string
  name: string
  degree: "bachelor" | "master" | "doctoral"
  students: number
}

export interface Faculty {
  id: string
  name: string
  code: string
  programs: StudyProgram[]
  students: number
}
