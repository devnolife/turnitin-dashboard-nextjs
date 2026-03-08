import type { Conversation } from "./conversation-list"
import type { Message } from "./message-thread"

export function generateMockConversations(): Conversation[] {
  return [
    {
      id: "conv-1",
      type: "individual",
      participants: ["instructor-1", "student-1"],
      participantNames: ["You", "John Doe"],
      subject: "Question about Assignment 2",
      lastMessage: "Thank you for the clarification, professor!",
      lastMessageTime: "Today, 10:30 AM",
      unread: false,
    },
    {
      id: "conv-2",
      type: "individual",
      participants: ["instructor-1", "student-2"],
      participantNames: ["You", "Jane Smith"],
      subject: "Extension Request",
      lastMessage: "I understand. I'll submit it by Friday.",
      lastMessageTime: "Yesterday",
      unread: true,
    },
    {
      id: "conv-3",
      type: "group",
      participants: ["instructor-1", "student-1", "student-2", "student-3"],
      participantNames: ["You", "John Doe", "Jane Smith", "Michael Johnson"],
      subject: "Final Project Group 1",
      lastMessage: "We've updated the project proposal as requested.",
      lastMessageTime: "2 days ago",
      unread: false,
    },
    {
      id: "conv-4",
      type: "individual",
      participants: ["instructor-1", "student-4"],
      participantNames: ["You", "Emily Davis"],
      subject: "Office Hours Appointment",
      lastMessage: "I'll be there at 3 PM tomorrow.",
      lastMessageTime: "3 days ago",
      unread: false,
    },
    {
      id: "conv-5",
      type: "announcement",
      participants: ["instructor-1", "course-1-students"],
      participantNames: ["You", "Computer Science 101 (All Students)"],
      subject: "Important: Midterm Exam Details",
      lastMessage: "The midterm exam will be held on May 15th. Please review chapters 1-5.",
      lastMessageTime: "1 week ago",
      unread: false,
    },
  ]
}

export function generateMockMessages(conversationId: string): Message[] {
  const messagesByConversation: Record<string, Message[]> = {
    "conv-1": [
      {
        id: "msg-1-1",
        senderId: "student-1",
        senderName: "John Doe",
        content:
          "Hello Professor, I have a question about Assignment 2. The instructions for the third problem are a bit unclear to me.",
        timestamp: "Yesterday, 2:15 PM",
      },
      {
        id: "msg-1-2",
        senderId: "instructor-1",
        senderName: "You",
        content: "Hi John, what specifically is unclear about the third problem?",
        timestamp: "Yesterday, 3:30 PM",
      },
      {
        id: "msg-1-3",
        senderId: "student-1",
        senderName: "John Doe",
        content: "I'm not sure if we need to implement both algorithms or just compare them theoretically.",
        timestamp: "Yesterday, 4:45 PM",
      },
      {
        id: "msg-1-4",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "You need to implement both algorithms and then compare their performance with at least three different input sizes. Let me know if you have any other questions!",
        timestamp: "Yesterday, 5:20 PM",
      },
      {
        id: "msg-1-5",
        senderId: "student-1",
        senderName: "John Doe",
        content: "Thank you for the clarification, professor!",
        timestamp: "Today, 10:30 AM",
      },
    ],
    "conv-2": [
      {
        id: "msg-2-1",
        senderId: "student-2",
        senderName: "Jane Smith",
        content:
          "Hello Professor, I wanted to request an extension for Assignment 3. I've been dealing with some health issues this week and haven't been able to make as much progress as I'd hoped.",
        timestamp: "Yesterday, 9:10 AM",
      },
      {
        id: "msg-2-2",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "Hi Jane, I'm sorry to hear that. Can you submit a doctor's note to the department office? If so, I can grant you an extension until Friday.",
        timestamp: "Yesterday, 10:25 AM",
      },
      {
        id: "msg-2-3",
        senderId: "student-2",
        senderName: "Jane Smith",
        content: "Yes, I can submit the note today. Thank you for understanding.",
        timestamp: "Yesterday, 11:40 AM",
      },
      {
        id: "msg-2-4",
        senderId: "instructor-1",
        senderName: "You",
        content: "Great. Please make sure to submit it by Friday at 11:59 PM.",
        timestamp: "Yesterday, 12:15 PM",
      },
      {
        id: "msg-2-5",
        senderId: "student-2",
        senderName: "Jane Smith",
        content: "I understand. I'll submit it by Friday.",
        timestamp: "Yesterday, 1:30 PM",
      },
    ],
    "conv-3": [
      {
        id: "msg-3-1",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "Hello everyone, I've reviewed your initial project proposal. There are a few areas that need more detail, particularly in the methodology section.",
        timestamp: "3 days ago, 10:00 AM",
      },
      {
        id: "msg-3-2",
        senderId: "student-1",
        senderName: "John Doe",
        content: "Thank you for the feedback. We'll work on expanding the methodology section.",
        timestamp: "3 days ago, 11:30 AM",
      },
      {
        id: "msg-3-3",
        senderId: "student-2",
        senderName: "Jane Smith",
        content: "Professor, do you have any specific recommendations for what we should include in the methodology?",
        timestamp: "3 days ago, 1:45 PM",
      },
      {
        id: "msg-3-4",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "Yes, you should include more details about your data collection methods, analysis techniques, and how you plan to validate your results.",
        timestamp: "2 days ago, 9:15 AM",
      },
      {
        id: "msg-3-5",
        senderId: "student-3",
        senderName: "Michael Johnson",
        content: "We've updated the project proposal as requested.",
        timestamp: "2 days ago, 4:30 PM",
      },
    ],
    "conv-4": [
      {
        id: "msg-4-1",
        senderId: "student-4",
        senderName: "Emily Davis",
        content:
          "Hello Professor, I'd like to schedule a meeting during your office hours to discuss my research project.",
        timestamp: "4 days ago, 2:00 PM",
      },
      {
        id: "msg-4-2",
        senderId: "instructor-1",
        senderName: "You",
        content: "Hi Emily, I have availability tomorrow between 2-4 PM. Would any time in that window work for you?",
        timestamp: "4 days ago, 3:15 PM",
      },
      {
        id: "msg-4-3",
        senderId: "student-4",
        senderName: "Emily Davis",
        content: "3 PM would work perfectly for me. Thank you!",
        timestamp: "4 days ago, 4:30 PM",
      },
      {
        id: "msg-4-4",
        senderId: "instructor-1",
        senderName: "You",
        content: "Great, I'll see you tomorrow at 3 PM in my office, Room 302.",
        timestamp: "3 days ago, 9:00 AM",
      },
      {
        id: "msg-4-5",
        senderId: "student-4",
        senderName: "Emily Davis",
        content: "I'll be there at 3 PM tomorrow.",
        timestamp: "3 days ago, 10:15 AM",
      },
    ],
    "conv-5": [
      {
        id: "msg-5-1",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "Important announcement regarding the upcoming midterm exam: The exam will be held on May 15th from 10 AM to 12 PM in Lecture Hall A. The exam will cover chapters 1-5 from the textbook and all material discussed in lectures up to May 10th.",
        timestamp: "1 week ago, 9:00 AM",
      },
      {
        id: "msg-5-2",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "I will hold a review session on May 13th from 3-5 PM in the regular classroom. Attendance is optional but recommended.",
        timestamp: "1 week ago, 9:05 AM",
      },
      {
        id: "msg-5-3",
        senderId: "instructor-1",
        senderName: "You",
        content:
          "Please bring your student ID and a calculator to the exam. No other electronic devices will be permitted.",
        timestamp: "1 week ago, 9:10 AM",
      },
    ],
  }

  return messagesByConversation[conversationId] || []
}

export function generateMockRecipients() {
  return [
    {
      id: "student-1",
      name: "John Doe",
      email: "john.doe@university.edu",
      type: "student",
    },
    {
      id: "student-2",
      name: "Jane Smith",
      email: "jane.smith@university.edu",
      type: "student",
    },
    {
      id: "student-3",
      name: "Michael Johnson",
      email: "michael.johnson@university.edu",
      type: "student",
    },
    {
      id: "student-4",
      name: "Emily Davis",
      email: "emily.davis@university.edu",
      type: "student",
    },
    {
      id: "student-5",
      name: "Robert Wilson",
      email: "robert.wilson@university.edu",
      type: "student",
    },
    {
      id: "course-1",
      name: "Computer Science 101",
      type: "course",
      studentCount: 42,
    },
    {
      id: "course-2",
      name: "Data Science 202",
      type: "course",
      studentCount: 38,
    },
    {
      id: "course-3",
      name: "AI Ethics 301",
      type: "course",
      studentCount: 28,
    },
  ]
}
