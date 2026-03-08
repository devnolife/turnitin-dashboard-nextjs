"use client"

import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardFooter } from "@/components/ui/card"

interface MessageComposerProps {
  isAnnouncement: boolean
  hasMessages: boolean
  newMessage: string
  onMessageChange: (value: string) => void
  onSendMessage: () => void
}

export function MessageComposer({
  isAnnouncement,
  hasMessages,
  newMessage,
  onMessageChange,
  onSendMessage,
}: MessageComposerProps) {
  return (
    <CardFooter className="border-t p-4">
      {!isAnnouncement || !hasMessages ? (
        <div className="flex w-full gap-2">
          <Button variant="outline" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSendMessage()
              }
            }}
          />
          <Button className="shrink-0" onClick={onSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full text-center text-sm text-muted-foreground">
          This is an announcement. Replies are not enabled.
        </div>
      )}
    </CardFooter>
  )
}
