"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Edit, Share } from "lucide-react"
import { SuccessCheckmark } from "./rps-result-animations"

interface RpsSuccessMessageProps {
  courseName: string
  onView: () => void
  onDownload: () => void
}

export function RpsSuccessMessage({ courseName, onView, onDownload }: RpsSuccessMessageProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <Card className="p-8 rounded-3xl border-0 shadow-lg bg-white dark:bg-gray-800 text-center">
        <div className="flex justify-center mb-6">
          <SuccessCheckmark />
        </div>

        <motion.h2
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          RPS Berhasil Dibuat!
        </motion.h2>

        <motion.p
          className="text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          RPS untuk mata kuliah <span className="font-semibold">{courseName}</span> telah berhasil dibuat dan siap untuk
          digunakan.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button className="rounded-full bg-gradient-to-r from-[#5fa2db] to-[#7ab8e6] text-white" onClick={onView}>
            <Edit className="mr-2 h-4 w-4" />
            Lihat RPS
          </Button>

          <Button variant="outline" className="rounded-full" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Unduh RPS
          </Button>

          <Button variant="ghost" className="rounded-full">
            <Share className="mr-2 h-4 w-4" />
            Bagikan
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  )
}
