import { create } from "zustand"
import type { Course, Assignment, Material, Announcement } from "@/lib/types/course"

export type { Course, Assignment, Material, Announcement } from "@/lib/types/course"

interface CourseState {
  courses: Course[]
  loading: boolean
  error: string | null
  selectedCourse: Course | null
  fetchCourses: () => Promise<void>
  fetchCourseById: (id: string) => Promise<void>
  createCourse: (course: Omit<Course, "id">) => Promise<void>
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
  addAssignment: (courseId: string, assignment: Omit<Assignment, "id">) => Promise<void>
  updateAssignment: (courseId: string, assignmentId: string, assignment: Partial<Assignment>) => Promise<void>
  deleteAssignment: (courseId: string, assignmentId: string) => Promise<void>
  addMaterial: (courseId: string, material: Omit<Material, "id">) => Promise<void>
  deleteMaterial: (courseId: string, materialId: string) => Promise<void>
  addAnnouncement: (courseId: string, announcement: Omit<Announcement, "id">) => Promise<void>
  deleteAnnouncement: (courseId: string, announcementId: string) => Promise<void>
}

// Mock data for courses
const mockCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    code: "CS101",
    description: "An introductory course to computer science principles and programming fundamentals.",
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    enrolledStudents: 45,
    assignments: [
      {
        id: "1",
        title: "Programming Basics",
        description: "Complete the basic programming exercises in Python.",
        dueDate: "2023-09-15",
        points: 100,
        status: "closed",
        submissions: 42,
        graded: 42,
      },
      {
        id: "2",
        title: "Data Structures",
        description: "Implement a linked list and binary search tree.",
        dueDate: "2023-10-10",
        points: 150,
        status: "closed",
        submissions: 40,
        graded: 38,
      },
      {
        id: "3",
        title: "Algorithms",
        description: "Implement sorting and searching algorithms.",
        dueDate: "2023-11-05",
        points: 200,
        status: "published",
        submissions: 30,
        graded: 15,
      },
      {
        id: "4",
        title: "Final Project",
        description: "Build a complete application using the concepts learned in class.",
        dueDate: "2023-12-10",
        points: 300,
        status: "published",
        submissions: 0,
        graded: 0,
      },
    ],
    materials: [
      {
        id: "1",
        title: "Introduction to Python",
        type: "document",
        url: "/materials/python-intro.pdf",
        uploadDate: "2023-09-01",
        size: "2.5 MB",
      },
      {
        id: "2",
        title: "Data Structures Tutorial",
        type: "video",
        url: "https://example.com/videos/data-structures",
        uploadDate: "2023-09-20",
      },
      {
        id: "3",
        title: "Algorithm Resources",
        type: "link",
        url: "https://example.com/resources/algorithms",
        uploadDate: "2023-10-15",
      },
    ],
    announcements: [
      {
        id: "1",
        title: "Welcome to CS101",
        content: "Welcome to Introduction to Computer Science! Please review the syllabus and course materials.",
        date: "2023-09-01",
        author: "Dr. Smith",
      },
      {
        id: "2",
        title: "Midterm Exam Information",
        content:
          "The midterm exam will be held on October 20th. It will cover all material up to and including data structures.",
        date: "2023-10-05",
        author: "Dr. Smith",
      },
    ],
  },
  {
    id: "2",
    title: "Advanced Programming",
    code: "CS201",
    description:
      "Advanced programming concepts including object-oriented design, design patterns, and software architecture.",
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    enrolledStudents: 32,
    assignments: [
      {
        id: "1",
        title: "Object-Oriented Design",
        description: "Design and implement a system using OOP principles.",
        dueDate: "2023-09-20",
        points: 100,
        status: "closed",
        submissions: 30,
        graded: 30,
      },
      {
        id: "2",
        title: "Design Patterns",
        description: "Implement various design patterns in a real-world application.",
        dueDate: "2023-10-15",
        points: 150,
        status: "published",
        submissions: 25,
        graded: 20,
      },
      {
        id: "3",
        title: "Final Project",
        description: "Develop a complete application using advanced programming concepts.",
        dueDate: "2023-12-10",
        points: 300,
        status: "published",
        submissions: 0,
        graded: 0,
      },
    ],
    materials: [
      {
        id: "1",
        title: "OOP Principles",
        type: "document",
        url: "/materials/oop-principles.pdf",
        uploadDate: "2023-09-01",
        size: "1.8 MB",
      },
      {
        id: "2",
        title: "Design Patterns Tutorial",
        type: "video",
        url: "https://example.com/videos/design-patterns",
        uploadDate: "2023-09-25",
      },
    ],
    announcements: [
      {
        id: "1",
        title: "Welcome to CS201",
        content: "Welcome to Advanced Programming! This course builds on the fundamentals you learned in CS101.",
        date: "2023-09-01",
        author: "Dr. Johnson",
      },
    ],
  },
  {
    id: "3",
    title: "Database Systems",
    code: "CS301",
    description: "Introduction to database design, SQL, and database management systems.",
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    enrolledStudents: 38,
    assignments: [
      {
        id: "1",
        title: "ER Diagrams",
        description: "Create entity-relationship diagrams for a given scenario.",
        dueDate: "2023-09-15",
        points: 100,
        status: "closed",
        submissions: 36,
        graded: 36,
      },
      {
        id: "2",
        title: "SQL Queries",
        description: "Write SQL queries to retrieve and manipulate data.",
        dueDate: "2023-10-10",
        points: 150,
        status: "published",
        submissions: 32,
        graded: 30,
      },
      {
        id: "3",
        title: "Database Implementation",
        description: "Implement a complete database system for a real-world application.",
        dueDate: "2023-11-20",
        points: 200,
        status: "published",
        submissions: 0,
        graded: 0,
      },
    ],
    materials: [
      {
        id: "1",
        title: "Database Design Principles",
        type: "document",
        url: "/materials/database-design.pdf",
        uploadDate: "2023-09-01",
        size: "3.2 MB",
      },
      {
        id: "2",
        title: "SQL Tutorial",
        type: "video",
        url: "https://example.com/videos/sql-tutorial",
        uploadDate: "2023-09-15",
      },
    ],
    announcements: [
      {
        id: "1",
        title: "Welcome to CS301",
        content: "Welcome to Database Systems! Please review the syllabus and course materials.",
        date: "2023-09-01",
        author: "Dr. Williams",
      },
    ],
  },
]

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  loading: false,
  error: null,
  selectedCourse: null,

  fetchCourses: async () => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ courses: mockCourses, loading: false })
    } catch (error) {
      set({ error: "Failed to fetch courses", loading: false })
    }
  },

  fetchCourseById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const course = mockCourses.find((c) => c.id === id)
      if (course) {
        set({ selectedCourse: course, loading: false })
      } else {
        set({ error: "Course not found", loading: false })
      }
    } catch (error) {
      set({ error: "Failed to fetch course", loading: false })
    }
  },

  createCourse: async (course) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newCourse = {
        ...course,
        id: Math.random().toString(36).substr(2, 9),
        assignments: [],
        materials: [],
        announcements: [],
      }
      set((state) => ({
        courses: [...state.courses, newCourse],
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to create course", loading: false })
    }
  },

  updateCourse: async (id, courseUpdate) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set((state) => ({
        courses: state.courses.map((course) => (course.id === id ? { ...course, ...courseUpdate } : course)),
        selectedCourse:
          state.selectedCourse?.id === id ? { ...state.selectedCourse, ...courseUpdate } : state.selectedCourse,
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to update course", loading: false })
    }
  },

  deleteCourse: async (id) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set((state) => ({
        courses: state.courses.filter((course) => course.id !== id),
        selectedCourse: state.selectedCourse?.id === id ? null : state.selectedCourse,
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to delete course", loading: false })
    }
  },

  addAssignment: async (courseId, assignment) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newAssignment = {
        ...assignment,
        id: Math.random().toString(36).substr(2, 9),
        submissions: 0,
        graded: 0,
      }
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              assignments: [...course.assignments, newAssignment],
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                assignments: [...state.selectedCourse.assignments, newAssignment],
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to add assignment", loading: false })
    }
  },

  updateAssignment: async (courseId, assignmentId, assignmentUpdate) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              assignments: course.assignments.map((assignment) =>
                assignment.id === assignmentId ? { ...assignment, ...assignmentUpdate } : assignment,
              ),
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                assignments: state.selectedCourse.assignments.map((assignment) =>
                  assignment.id === assignmentId ? { ...assignment, ...assignmentUpdate } : assignment,
                ),
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to update assignment", loading: false })
    }
  },

  deleteAssignment: async (courseId, assignmentId) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              assignments: course.assignments.filter((assignment) => assignment.id !== assignmentId),
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                assignments: state.selectedCourse.assignments.filter((assignment) => assignment.id !== assignmentId),
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to delete assignment", loading: false })
    }
  },

  addMaterial: async (courseId, material) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newMaterial = {
        ...material,
        id: Math.random().toString(36).substr(2, 9),
        uploadDate: new Date().toISOString().split("T")[0],
      }
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              materials: [...course.materials, newMaterial],
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                materials: [...state.selectedCourse.materials, newMaterial],
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to add material", loading: false })
    }
  },

  deleteMaterial: async (courseId, materialId) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              materials: course.materials.filter((material) => material.id !== materialId),
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                materials: state.selectedCourse.materials.filter((material) => material.id !== materialId),
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to delete material", loading: false })
    }
  },

  addAnnouncement: async (courseId, announcement) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newAnnouncement = {
        ...announcement,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split("T")[0],
      }
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              announcements: [...course.announcements, newAnnouncement],
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                announcements: [...state.selectedCourse.announcements, newAnnouncement],
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to add announcement", loading: false })
    }
  },

  deleteAnnouncement: async (courseId, announcementId) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set((state) => {
        const updatedCourses = state.courses.map((course) => {
          if (course.id === courseId) {
            return {
              ...course,
              announcements: course.announcements.filter((announcement) => announcement.id !== announcementId),
            }
          }
          return course
        })

        const updatedSelectedCourse =
          state.selectedCourse?.id === courseId
            ? {
                ...state.selectedCourse,
                announcements: state.selectedCourse.announcements.filter(
                  (announcement) => announcement.id !== announcementId,
                ),
              }
            : state.selectedCourse

        return {
          courses: updatedCourses,
          selectedCourse: updatedSelectedCourse,
          loading: false,
        }
      })
    } catch (error) {
      set({ error: "Failed to delete announcement", loading: false })
    }
  },
}))

