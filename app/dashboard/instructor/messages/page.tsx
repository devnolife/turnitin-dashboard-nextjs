import type { Metadata } from "next"
import { MessagesPage } from "@/components/dashboard/instructor/messages/messages-page"

export const metadata: Metadata = {
  title: "Messages - Instructor Dashboard - Turnitin Campus",
  description: "Communicate with your students and colleagues",
}

export default function InstructorMessagesPage() {
  return <MessagesPage />
}

