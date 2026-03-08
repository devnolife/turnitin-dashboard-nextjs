"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { ConversationList } from "./conversation-list"
import { MessageThread } from "./message-thread"
import type { Conversation } from "./conversation-list"
import type { Message } from "./message-thread"
import {
  generateMockConversations,
  generateMockMessages,
  generateMockRecipients,
} from "./mock-data"

export function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false)
  const [newConversation, setNewConversation] = useState({
    type: "individual",
    recipients: [] as string[],
    subject: "",
    message: "",
  })
  const [availableRecipients, setAvailableRecipients] = useState<any[]>([])

  const { toast } = useToast()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true)

      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const mockConversations = generateMockConversations()
        setConversations(mockConversations)

        if (mockConversations.length > 0) {
          setSelectedConversation(mockConversations[0])
          setMessages(generateMockMessages(mockConversations[0].id))
        }

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

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      conversation.subject.toLowerCase().includes(query) ||
      conversation.participantNames.some((name: string) => name.toLowerCase().includes(query))
    )
  })

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setMessages(generateMockMessages(conversation.id))

    if (conversation.unread) {
      setConversations(conversations.map((conv) => (conv.id === conversation.id ? { ...conv, unread: false } : conv)))
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const newMsg: Message = {
      id: `msg-${selectedConversation.id}-${messages.length + 1}`,
      senderId: "instructor-1",
      senderName: "You",
      content: newMessage,
      timestamp: "Just now",
    }

    setMessages([...messages, newMsg])

    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage, lastMessageTime: "Just now" }
          : conv,
      ),
    )

    setNewMessage("")
  }

  const handleCreateConversation = () => {
    if (!newConversation.recipients.length || !newConversation.subject || !newConversation.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    const newConvId = `conv-${conversations.length + 1}`
    const isGroup = newConversation.type === "group" && newConversation.recipients.length > 1
    const isAnnouncement = newConversation.type === "announcement"

    const recipients = newConversation.recipients.map((id) => {
      const recipient = availableRecipients.find((r: any) => r.id === id)
      return recipient ? recipient.name : id
    })

    const createdConversation: Conversation = {
      id: newConvId,
      type: (isAnnouncement ? "announcement" : isGroup ? "group" : "individual") as Conversation["type"],
      participants: ["instructor-1", ...newConversation.recipients],
      participantNames: ["You", ...recipients],
      subject: newConversation.subject,
      lastMessage: newConversation.message,
      lastMessageTime: "Just now",
      unread: false,
    }

    const initialMessage: Message = {
      id: `msg-${newConvId}-1`,
      senderId: "instructor-1",
      senderName: "You",
      content: newConversation.message,
      timestamp: "Just now",
    }

    setConversations([createdConversation, ...conversations])
    setSelectedConversation(createdConversation)
    setMessages([initialMessage])

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
                        .filter((r: any) =>
                          newConversation.type === "announcement" ? r.type === "course" : r.type === "student",
                        )
                        .map((recipient: any) => (
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
          <ConversationList
            conversations={conversations}
            filteredConversations={filteredConversations}
            selectedConversation={selectedConversation}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectConversation={handleSelectConversation}
            onNewConversation={() => setNewConversationDialogOpen(true)}
          />

          <MessageThread
            selectedConversation={selectedConversation}
            messages={messages}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={handleSendMessage}
            onNewConversation={() => setNewConversationDialogOpen(true)}
          />
        </div>
      </div>
    </PageTransition>
  )
}

