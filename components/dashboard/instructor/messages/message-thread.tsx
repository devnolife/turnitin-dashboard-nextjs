"use client"

import { useRef, useEffect } from "react"
import {
  Plus,
  MoreHorizontal,
  User,
  Clock,
  MessageSquare,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageComposer } from "./message-composer"
import type { Conversation } from "./conversation-list"

export interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

interface MessageThreadProps {
  selectedConversation: Conversation | null
  messages: Message[]
  newMessage: string
  onMessageChange: (value: string) => void
  onSendMessage: () => void
  onNewConversation: () => void
}

export function MessageThread({
  selectedConversation,
  messages,
  newMessage,
  onMessageChange,
  onSendMessage,
  onNewConversation,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
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
          <MessageComposer
            isAnnouncement={selectedConversation.type === "announcement"}
            hasMessages={messages.length > 0}
            newMessage={newMessage}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
          <h2 className="mt-4 text-xl font-medium">No Conversation Selected</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select a conversation from the list or start a new one.
          </p>
          <Button className="mt-4" onClick={onNewConversation}>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>
      )}
    </Card>
  )
}
