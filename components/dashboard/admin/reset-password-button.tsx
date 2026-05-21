"use client"

import { useState } from "react"
import { KeyRound, Copy, Check, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import api from "@/lib/api/client"

interface Props {
  userId: string
  userName: string
  username: string
  triggerClassName?: string
}

export function ResetPasswordButton({ userId, userName, username }: Props) {
  const { toast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const onConfirm = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`)
      setTempPassword(res.data.tempPassword)
      setConfirmOpen(false)
      setResultOpen(true)
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Gagal mereset password"
      toast({ variant: "destructive", title: "Reset gagal", description: message })
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    if (!tempPassword) return
    await navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
      >
        <KeyRound className="mr-2 size-3" />
        Reset Password
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset password {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghasilkan password sementara. Semua sesi aktif user akan
              dihentikan. User wajib mengganti password saat login berikutnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void onConfirm()
              }}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Ya, Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={resultOpen}
        onOpenChange={(open) => {
          setResultOpen(open)
          if (!open) setTempPassword(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-amber-600" />
              Password Sementara
            </DialogTitle>
            <DialogDescription>
              Berikan password ini kepada <strong>{userName}</strong> (<code>{username}</code>).
              Password hanya ditampilkan satu kali.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
            <div className="flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-bold tracking-wider text-amber-900 dark:text-amber-200">
                {tempPassword}
              </code>
              <Button size="sm" variant="outline" onClick={copy}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 size-3.5" /> Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5" /> Salin
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <p>
              Setelah dialog ini ditutup, password tidak dapat dilihat lagi. Pastikan sudah
              disampaikan ke user terlebih dahulu.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setResultOpen(false)}>Selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
