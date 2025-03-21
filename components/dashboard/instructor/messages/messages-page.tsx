"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Send,
  Paperclip,
  MoreHorizontal,
  ChevronRight,
  Users,
  User,
  Clock,
  MessageSquare,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store/auth-store"
import { PageTransition } from "@/components/ui/motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false)
  const [newConversation, setNewConversation] = useState({
    type: "individual",
    recipients: [],
    subject: "",
    message: "",
  })
  const [availableRecipients, setAvailableRecipients] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true)

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Generate mock conversations
        const mockConversations = generateMockConversations()
        setConversations(mockConversations)

        // Set first conversation as selected by default
        if (mockConversations.length > 0) {
          setSelectedConversation(mockConversations[0])
          setMessages(generateMockMessages(mockConversations[0].id))
        }

        // Generate mock recipients
        setAvailableRecipients(generateMockRecipients())
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversations. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [toast])

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Generate mock conversations
  const generateMockConversations = () => {
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

  // Generate mock messages for a conversation
  const generateMockMessages = (conversationId: string) => {
    const messagesByConversation: Record<string, any[]> = {
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

  // Generate mock recipients
  const generateMockRecipients = () => {
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

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      conversation.subject.toLowerCase().includes(query) ||
      conversation.participantNames.some((name: string) => name.toLowerCase().includes(query))
    )
  })

  // Handle select conversation
  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    setMessages(generateMockMessages(conversation.id))

    // Mark as read if unread
    if (conversation.unread) {
      setConversations(conversations.map((conv) => (conv.id === conversation.id ? { ...conv, unread: false } : conv)))
    }
  }

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const newMsg = {
      id: `msg-${selectedConversation.id}-${messages.length + 1}`,
      senderId: "instructor-1",
      senderName: "You",
      content: newMessage,
      timestamp: "Just now",
    }

    setMessages([...messages, newMsg])

    // Update last message in conversation
    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              lastMessage: newMessage,
              lastMessageTime: "Just now",
            }
          : conv,
      ),
    )

    setNewMessage("")
  }

  // Handle create new conversation
  const handleCreateConversation = () => {
    if (!newConversation.recipients.length || !newConversation.subject || !newConversation.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Create new conversation
    const newConvId = `conv-${conversations.length + 1}`
    const isGroup = newConversation.type === "group" && newConversation.recipients.length > 1
    const isAnnouncement = newConversation.type === "announcement"

    const recipients = newConversation.recipients.map((id) => {
      const recipient = availableRecipients.find((r) => r.id === id)
      return recipient ? recipient.name : id
    })

    const createdConversation = {
      id: newConvId,
      type: isAnnouncement ? "announcement" : isGroup ? "group" : "individual",
      participants: ["instructor-1", ...newConversation.recipients],
      participantNames: ["You", ...recipients],
      subject: newConversation.subject,
      lastMessage: newConversation.message,
      lastMessageTime: "Just now",
      unread: false,
    }

    // Create initial message
    const initialMessage = {
      id: `msg-${newConvId}-1`,
      senderId: "instructor-1",
      senderName: "You",
      content: newConversation.message,
      timestamp: "Just now",
    }

    // Add conversation and select it
    setConversations([createdConversation, ...conversations])
    setSelectedConversation(createdConversation)
    setMessages([initialMessage])

    // Reset form and close dialog
    setNewConversation({
      type: "individual",
      recipients: [],
      subject: "",
      message: "",
    })
    setNewConversationDialogOpen(false)

    toast({
      title: "Conversation Created",
      description: "Your message has been sent successfully.",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Messages</h1>
            <p className="text-muted-foreground">Communicate with your students and colleagues</p>
          </div>
          <Dialog open={newConversationDialogOpen} onOpenChange={setNewConversationDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
                <DialogDescription>Create a new conversation or announcement.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Message Type</Label>
                  <Tabs
                    defaultValue="individual"
                    value={newConversation.type}
                    onValueChange={(value) => setNewConversation({ ...newConversation, type: value })}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="individual">Individual</TabsTrigger>
                      <TabsTrigger value="group">Group</TabsTrigger>
                      <TabsTrigger value="announcement">Announcement</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipients">
                    {newConversation.type === "announcement" ? "Course" : "Recipients"}
                  </Label>
                  <Select
                    value={newConversation.recipients[0] || ""}
                    onValueChange={(value) => setNewConversation({ ...newConversation, recipients: [value] })}
                    disabled={newConversation.type === "group"}
                  >
                    <SelectTrigger id="recipients">
                      <SelectValue
                        placeholder={newConversation.type === "announcement" ? "Select a course" : "Select a recipient"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRecipients
                        .filter((r) =>
                          newConversation.type === "announcement" ? r.type === "course" : r.type === "student",
                        )
                        .map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.name}
                            {recipient.type === "course" && ` (${recipient.studentCount} students)`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter subject"
                    value={newConversation.subject}
                    onChange={(e) => setNewConversation({ ...newConversation, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={newConversation.message}
                    onChange={(e) => setNewConversation({ ...newConversation, message: e.target.value })}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewConversationDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConversation}>Send Message</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-2">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`rounded-md p-3 cursor-pointer transition-colors ${
                          selectedConversation?.id === conversation.id ? "bg-muted" : "hover:bg-muted/50"
                        } ${conversation.unread ? "border-l-4 border-primary" : ""}`}
                        onClick={() => handleSelectConversation(conversation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {conversation.type === "group" ? (
                                <Users className="h-4 w-4 text-muted-foreground" />
                              ) : conversation.type === "announcement" ? (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div className="font-medium truncate">{conversation.subject}</div>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {conversation.type === "individual"
                                ? conversation.participantNames[1]
                                : conversation.type === "group"
                                  ? `${conversation.participantNames.length - 1} participants`
                                  : conversation.participantNames[1]}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {conversation.lastMessageTime}
                          </div>
                        </div>
                        <div className="mt-1 text-sm truncate">{conversation.lastMessage}</div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/60" />
                      <h3 className="mt-2 text-lg font-medium">No Conversations</h3>
                      <p className="text-sm text-muted-foreground">
                        {conversations.length === 0
                          ? "You don't have any conversations yet."
                          : "No conversations match your search."}
                      </p>
                      {conversations.length === 0 && (
                        <Button className="mt-4" onClick={() => setNewConversationDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Start a Conversation
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedConversation.subject}</CardTitle>
                      <CardDescription>
                        {selectedConversation.type === "individual"
                          ? `Conversation with ${selectedConversation.participantNames[1]}`
                          : selectedConversation.type === "group"
                            ? `Group conversation with ${selectedConversation.participantNames.slice(1).join(", ")}`
                            : `Announcement to ${selectedConversation.participantNames[1]}`}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" />
                          Message History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100vh-24rem)]">
                    <div className="p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === "instructor-1" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.senderId === "instructor-1" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{message.senderName}</span>
                              <span className="text-xs opacity-70">{message.timestamp}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="border-t p-4">
                  {selectedConversation.type !== "announcement" || messages.length === 0 ? (
                    <div className="flex w-full gap-2">
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button className="shrink-0" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full text-center text-sm text-muted-foreground">
                      This is an announcement. Replies are not enabled.
                    </div>
                  )}
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
                <h2 className="mt-4 text-xl font-medium">No Conversation Selected</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a conversation from the list or start a new one.
                </p>
                <Button className="mt-4" onClick={() => setNewConversationDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Message
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

