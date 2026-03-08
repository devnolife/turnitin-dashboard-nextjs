import type { Course, Material, Assignment, Student } from "./course-detail-types"

export function generateMockCourse(id: string): Course | null {
  const courses: Course[] = [
    {
      id: "course-1",
      title: "Computer Science 101",
      code: "CS101",
      description:
        "Introduction to Computer Science and Programming. This course covers the basics of programming, algorithms, and computational thinking. Students will learn fundamental concepts and problem-solving techniques.",
      programId: "prog-1",
      semester: "Spring",
      year: 2025,
      status: "active",
      studentCount: 42,
      materialsCount: 15,
      assignmentsCount: 8,
      lastUpdated: "2 days ago",
    },
    {
      id: "course-2",
      title: "Data Science 202",
      code: "DS202",
      description:
        "Intermediate Data Science and Analysis. This course explores statistical methods, data visualization, and machine learning techniques for analyzing complex datasets.",
      programId: "prog-5",
      semester: "Spring",
      year: 2025,
      status: "active",
      studentCount: 38,
      materialsCount: 12,
      assignmentsCount: 6,
      lastUpdated: "1 week ago",
    },
    {
      id: "course-3",
      title: "AI Ethics 301",
      code: "AI301",
      description:
        "Ethical Considerations in Artificial Intelligence. This course examines the ethical implications of AI technologies and their impact on society.",
      programId: "prog-9",
      semester: "Spring",
      year: 2025,
      status: "active",
      studentCount: 28,
      materialsCount: 10,
      assignmentsCount: 5,
      lastUpdated: "3 days ago",
    },
  ]

  return courses.find((course) => course.id === id) || null
}

export function generateMockMaterials(): Material[] {
  return [
    {
      id: "material-1",
      title: "Course Syllabus",
      type: "document",
      description: "Complete course syllabus with schedule and requirements",
      uploadedAt: "2 weeks ago",
      fileSize: "245 KB",
      downloadUrl: "#",
    },
    {
      id: "material-2",
      title: "Introduction to Programming Lecture Slides",
      type: "presentation",
      description: "Slides from the first lecture covering programming basics",
      uploadedAt: "2 weeks ago",
      fileSize: "3.2 MB",
      downloadUrl: "#",
    },
    {
      id: "material-3",
      title: "Algorithms and Data Structures Overview",
      type: "document",
      description: "Comprehensive guide to common algorithms and data structures",
      uploadedAt: "1 week ago",
      fileSize: "1.8 MB",
      downloadUrl: "#",
    },
    {
      id: "material-4",
      title: "Introduction to Python Programming",
      type: "video",
      description: "Video tutorial on Python basics for beginners",
      uploadedAt: "1 week ago",
      fileSize: "128 MB",
      downloadUrl: "#",
    },
    {
      id: "material-5",
      title: "Additional Resources and References",
      type: "link",
      description: "Collection of useful external resources and references",
      uploadedAt: "5 days ago",
      downloadUrl: "#",
    },
  ]
}

export function generateMockAssignments(): Assignment[] {
  return [
    {
      id: "assignment-1",
      title: "Programming Fundamentals Quiz",
      description: "Quiz covering basic programming concepts and syntax",
      dueDate: "March 15, 2025",
      status: "closed",
      submissionCount: 40,
      maxScore: 100,
    },
    {
      id: "assignment-2",
      title: "Algorithm Implementation Project",
      description: "Implement and analyze common sorting algorithms",
      dueDate: "April 5, 2025",
      status: "published",
      submissionCount: 35,
      maxScore: 100,
    },
    {
      id: "assignment-3",
      title: "Data Structures Assignment",
      description: "Implement and use various data structures to solve problems",
      dueDate: "April 20, 2025",
      status: "published",
      submissionCount: 0,
      maxScore: 100,
    },
    {
      id: "assignment-4",
      title: "Final Project Proposal",
      description: "Submit a proposal for your final course project",
      dueDate: "May 1, 2025",
      status: "draft",
      submissionCount: 0,
      maxScore: 50,
    },
  ]
}

export function generateMockStudents(): Student[] {
  return [
    {
      id: "student-1",
      name: "John Doe",
      email: "john.doe@university.edu",
      studentId: "S1001",
      status: "active",
      lastActive: "Today",
      submissionCount: 2,
      averageScore: 92,
    },
    {
      id: "student-2",
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      studentId: "S1002",
      status: "active",
      lastActive: "Yesterday",
      submissionCount: 2,
      averageScore: 88,
    },
    {
      id: "student-3",
      name: "Michael Johnson",
      email: "michael.johnson@university.edu",
      studentId: "S1003",
      status: "active",
      lastActive: "2 days ago",
      submissionCount: 1,
      averageScore: 75,
    },
    {
      id: "student-4",
      name: "Emily Davis",
      email: "emily.davis@university.edu",
      studentId: "S1004",
      status: "inactive",
      lastActive: "2 weeks ago",
      submissionCount: 0,
      averageScore: null,
    },
    {
      id: "student-5",
      name: "Robert Wilson",
      email: "robert.wilson@university.edu",
      studentId: "S1005",
      status: "active",
      lastActive: "Today",
      submissionCount: 2,
      averageScore: 95,
    },
  ]
}
