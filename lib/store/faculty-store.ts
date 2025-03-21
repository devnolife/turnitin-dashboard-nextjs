import { create } from "zustand"

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

interface FacultyState {
  faculties: Faculty[]
  isLoading: boolean
  error: string | null
  fetchFaculties: () => Promise<void>
}

export const useFacultyStore = create<FacultyState>()((set) => ({
  faculties: [
    {
      id: "fac-1",
      name: "Faculty of Computer Science",
      code: "FCS",
      students: 1250,
      programs: [
        {
          id: "prog-1",
          name: "Computer Science",
          degree: "bachelor",
          students: 450,
        },
        {
          id: "prog-2",
          name: "Information Systems",
          degree: "bachelor",
          students: 380,
        },
        {
          id: "prog-3",
          name: "Data Science",
          degree: "master",
          students: 220,
        },
        {
          id: "prog-4",
          name: "Artificial Intelligence",
          degree: "doctoral",
          students: 200,
        },
      ],
    },
    {
      id: "fac-2",
      name: "Faculty of Engineering",
      code: "FE",
      students: 1800,
      programs: [
        {
          id: "prog-5",
          name: "Electrical Engineering",
          degree: "bachelor",
          students: 520,
        },
        {
          id: "prog-6",
          name: "Mechanical Engineering",
          degree: "bachelor",
          students: 480,
        },
        {
          id: "prog-7",
          name: "Civil Engineering",
          degree: "bachelor",
          students: 420,
        },
        {
          id: "prog-8",
          name: "Industrial Engineering",
          degree: "master",
          students: 380,
        },
      ],
    },
    {
      id: "fac-3",
      name: "Faculty of Economics & Business",
      code: "FEB",
      students: 1650,
      programs: [
        {
          id: "prog-9",
          name: "Management",
          degree: "bachelor",
          students: 580,
        },
        {
          id: "prog-10",
          name: "Accounting",
          degree: "bachelor",
          students: 520,
        },
        {
          id: "prog-11",
          name: "Business Administration",
          degree: "master",
          students: 320,
        },
        {
          id: "prog-12",
          name: "Economics",
          degree: "doctoral",
          students: 230,
        },
      ],
    },
    {
      id: "fac-4",
      name: "Faculty of Medicine",
      code: "FM",
      students: 980,
      programs: [
        {
          id: "prog-13",
          name: "Medicine",
          degree: "bachelor",
          students: 420,
        },
        {
          id: "prog-14",
          name: "Nursing",
          degree: "bachelor",
          students: 380,
        },
        {
          id: "prog-15",
          name: "Public Health",
          degree: "master",
          students: 180,
        },
      ],
    },
    {
      id: "fac-5",
      name: "Faculty of Social Sciences",
      code: "FSS",
      students: 1420,
      programs: [
        {
          id: "prog-16",
          name: "Psychology",
          degree: "bachelor",
          students: 480,
        },
        {
          id: "prog-17",
          name: "Sociology",
          degree: "bachelor",
          students: 320,
        },
        {
          id: "prog-18",
          name: "Communication Studies",
          degree: "bachelor",
          students: 350,
        },
        {
          id: "prog-19",
          name: "International Relations",
          degree: "master",
          students: 270,
        },
      ],
    },
  ],
  isLoading: false,
  error: null,

  fetchFaculties: async () => {
    set({ isLoading: true, error: null })

    try {
      // In a real app, this would be an API call
      // For now, we're using the mock data already set in the state

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Data is already set in the initial state
      set({ isLoading: false })
    } catch (error) {
      set({
        error: "Failed to fetch faculties. Please try again.",
        isLoading: false,
      })
    }
  },
}))

