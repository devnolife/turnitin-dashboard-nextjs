"use client"

import {
  Search,
  Plus,
  Users,
  User,
  ChevronRight,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Conversation {
  id: string
  type: "individual" | "group" | "announcement"
  participants: string[]
  participantNames: string[]
  subject: string
  lastMessage: string
  lastMessageTime: string
  unread: boolean
}

interface ConversationListProps {
  conversations: Conversation[]
  filteredConversations: Conversation[]
  selectedConversation: Conversation | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onSelectConversation: (conversation: Conversation) => void
  onNewConversation: () => void
}

export function ConversationList({
  conversations,
  filteredConversations,
  selectedConversation,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  return (
    <Card className="md:col-span-1 flex flex-col">
      <CardHeader className="pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                  onClick={() => onSelectConversation(conversation)}
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
                  <Button className="mt-4" onClick={onNewConversation}>
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
  )
}
