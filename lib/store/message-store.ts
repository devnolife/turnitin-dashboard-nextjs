import { create } from "zustand"
import type { Message, Attachment, Conversation } from "@/lib/types/message"

export type { Message, Attachment, Conversation } from "@/lib/types/message"

interface MessageState {
  inbox: Message[]
  sent: Message[]
  conversations: Conversation[]
  selectedConversation: string | null
  conversationMessages: Message[]
  loading: boolean
  error: string | null
  fetchInbox: () => Promise<void>
  fetchSent: () => Promise<void>
  fetchConversations: () => Promise<void>
  fetchConversationMessages: (conversationId: string) => Promise<void>
  sendMessage: (message: Omit<Message, "id" | "timestamp" | "read">) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
}

// Mock data for messages
const mockInbox: Message[] = [
  {
    id: "1",
    senderId: "student1",
    senderName: "John Doe",
    senderRole: "student",
    recipientId: "instructor1",
    recipientName: "Dr. Smith",
    subject: "Question about Assignment 2",
    content:
      "Hello Dr. Smith, I have a question about the second assignment. Could you please clarify the requirements for the data structures implementation?",
    timestamp: "2023-11-05T14:30:00Z",
    read: true,
  },
  {
    id: "2",
    senderId: "student2",
    senderName: "Jane Smith",
    senderRole: "student",
    recipientId: "instructor1",
    recipientName: "Dr. Smith",
    subject: "Request for Extension",
    content:
      "Dear Dr. Smith, Due to unforeseen circumstances, I would like to request an extension for the upcoming assignment. I can provide documentation if needed.",
    timestamp: "2023-11-06T09:15:00Z",
    read: false,
  },
  {
    id: "3",
    senderId: "admin1",
    senderName: "Admin User",
    senderRole: "admin",
    recipientId: "instructor1",
    recipientName: "Dr. Smith",
    subject: "Department Meeting",
    content:
      "This is a reminder that we have a department meeting scheduled for Friday at 2 PM. Please prepare a brief update on your courses.",
    timestamp: "2023-11-06T11:45:00Z",
    read: false,
  },
]

const mockSent: Message[] = [
  {
    id: "4",
    senderId: "instructor1",
    senderName: "Dr. Smith",
    senderRole: "instructor",
    recipientId: "student1",
    recipientName: "John Doe",
    subject: "Re: Question about Assignment 2",
    content:
      "Hello John, The requirements for the data structures implementation are detailed in the assignment document. You need to implement both a linked list and a binary search tree with the specified operations.",
    timestamp: "2023-11-05T15:45:00Z",
    read: true,
  },
  {
    id: "5",
    senderId: "instructor1",
    senderName: "Dr. Smith",
    senderRole: "instructor",
    recipientId: "student3",
    recipientName: "Alice Johnson",
    subject: "Feedback on Your Project",
    content:
      "Hi Alice, I've reviewed your project proposal and have some feedback. Overall, it looks good, but I suggest focusing more on the implementation details and providing a clearer timeline.",
    timestamp: "2023-11-04T10:30:00Z",
    read: false,
  },
]

const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participantId: "student1",
    participantName: "John Doe",
    participantRole: "student",
    lastMessage: "Hello Dr. Smith, I have a question about the second assignment.",
    lastMessageTimestamp: "2023-11-05T14:30:00Z",
    unreadCount: 0,
  },
  {
    id: "conv2",
    participantId: "student2",
    participantName: "Jane Smith",
    participantRole: "student",
    lastMessage: "Dear Dr. Smith, Due to unforeseen circumstances, I would like to request an extension.",
    lastMessageTimestamp: "2023-11-06T09:15:00Z",
    unreadCount: 1,
  },
  {
    id: "conv3",
    participantId: "admin1",
    participantName: "Admin User",
    participantRole: "admin",
    lastMessage: "This is a reminder that we have a department meeting scheduled for Friday.",
    lastMessageTimestamp: "2023-11-06T11:45:00Z",
    unreadCount: 1,
  },
  {
    id: "conv4",
    participantId: "student3",
    participantName: "Alice Johnson",
    participantRole: "student",
    lastMessage: "Hi Alice, I've reviewed your project proposal and have some feedback.",
    lastMessageTimestamp: "2023-11-04T10:30:00Z",
    unreadCount: 0,
  },
]

const mockConversationMessages: Record<string, Message[]> = {
  conv1: [
    {
      id: "1",
      senderId: "student1",
      senderName: "John Doe",
      senderRole: "student",
      recipientId: "instructor1",
      recipientName: "Dr. Smith",
      subject: "Question about Assignment 2",
      content:
        "Hello Dr. Smith, I have a question about the second assignment. Could you please clarify the requirements for the data structures implementation?",
      timestamp: "2023-11-05T14:30:00Z",
      read: true,
    },
    {
      id: "4",
      senderId: "instructor1",
      senderName: "Dr. Smith",
      senderRole: "instructor",
      recipientId: "student1",
      recipientName: "John Doe",
      subject: "Re: Question about Assignment 2",
      content:
        "Hello John, The requirements for the data structures implementation are detailed in the assignment document. You need to implement both a linked list and a binary search tree with the specified operations.",
      timestamp: "2023-11-05T15:45:00Z",
      read: true,
    },
  ],
  conv2: [
    {
      id: "2",
      senderId: "student2",
      senderName: "Jane Smith",
      senderRole: "student",
      recipientId: "instructor1",
      recipientName: "Dr. Smith",
      subject: "Request for Extension",
      content:
        "Dear Dr. Smith, Due to unforeseen circumstances, I would like to request an extension for the upcoming assignment. I can provide documentation if needed.",
      timestamp: "2023-11-06T09:15:00Z",
      read: false,
    },
  ],
  conv3: [
    {
      id: "3",
      senderId: "admin1",
      senderName: "Admin User",
      senderRole: "admin",
      recipientId: "instructor1",
      recipientName: "Dr. Smith",
      subject: "Department Meeting",
      content:
        "This is a reminder that we have a department meeting scheduled for Friday at 2 PM. Please prepare a brief update on your courses.",
      timestamp: "2023-11-06T11:45:00Z",
      read: false,
    },
  ],
  conv4: [
    {
      id: "5",
      senderId: "instructor1",
      senderName: "Dr. Smith",
      senderRole: "instructor",
      recipientId: "student3",
      recipientName: "Alice Johnson",
      subject: "Feedback on Your Project",
      content:
        "Hi Alice, I've reviewed your project proposal and have some feedback. Overall, it looks good, but I suggest focusing more on the implementation details and providing a clearer timeline.",
      timestamp: "2023-11-04T10:30:00Z",
      read: false,
    },
  ],
}

export const useMessageStore = create<MessageState>((set) => ({
  inbox: [],
  sent: [],
  conversations: [],
  selectedConversation: null,
  conversationMessages: [],
  loading: false,
  error: null,

  fetchInbox: async () => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ inbox: mockInbox, loading: false })
    } catch (error) {
      set({ error: "Failed to fetch inbox messages", loading: false })
    }
  },

  fetchSent: async () => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ sent: mockSent, loading: false })
    } catch (error) {
      set({ error: "Failed to fetch sent messages", loading: false })
    }
  },

  fetchConversations: async () => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ conversations: mockConversations, loading: false })
    } catch (error) {
      set({ error: "Failed to fetch conversations", loading: false })
    }
  },

  fetchConversationMessages: async (conversationId) => {
    set({ loading: true, error: null, selectedConversation: conversationId })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      set({ conversationMessages: mockConversationMessages[conversationId] || [], loading: false })
    } catch (error) {
      set({ error: "Failed to fetch conversation messages", loading: false })
    }
  },

  sendMessage: async (message) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, you would send the message to the server and update the state accordingly
      console.log("Message sent:", message)
      set({ loading: false })
    } catch (error) {
      set({ error: "Failed to send message", loading: false })
    }
  },

  markAsRead: async (messageId) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, you would update the message status on the server and update the state accordingly
      console.log("Message marked as read:", messageId)
      set({ loading: false })
    } catch (error) {
      set({ error: "Failed to mark message as read", loading: false })
    }
  },

  deleteMessage: async (messageId) => {
    set({ loading: true, error: null })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, you would delete the message on the server and update the state accordingly
      console.log("Message deleted:", messageId)
      set({ loading: false })
    } catch (error) {
      set({ error: "Failed to delete message", loading: false })
    }
  },
}))

