export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "instructor" | "student" | "admin"
  recipientId: string
  recipientName: string
  subject: string
  content: string
  timestamp: string
  read: boolean
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  name: string
  type: string
  size: string
  url: string
}

export interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantRole: "instructor" | "student" | "admin"
  lastMessage: string
  lastMessageTimestamp: string
  unreadCount: number
}
