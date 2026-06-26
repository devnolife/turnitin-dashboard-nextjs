import { NextRequest, NextResponse } from "next/server"
import path from "path"
import mammoth from "mammoth"
import { prisma } from "@/lib/prisma"
import { verifyAuth, handleAuthError, AuthError } from "@/lib/auth/verify-token"
import { readStoredFile } from "@/lib/upload"

export const runtime = "nodejs"

/**
 * Sanitasi ringan untuk output mammoth (docx→html). Mammoth HANYA menghasilkan
 * elemen semantik terbatas (p, h1-6, ul/ol/li, table, strong, em, a, img, br) —
 * bukan HTML mentah dari user — sehingga cukup: buang elemen berbahaya, hapus
 * atribut event handler, dan netralkan URL berskema berbahaya. Ini menghindari
 * dependency berat (jsdom/DOMPurify) yang memperlambat route.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<\/?(?:script|style|iframe|object|embed|link|meta|base|form|svg)\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/\s(href|src)\s*=\s*"(\s*(?:javascript|vbscript|data):[^"]*)"/gi, (m, attr, val) =>
      /^\s*data:image\//i.test(val) ? m : ` ${attr}="#"`,
    )
    .replace(/\s(href|src)\s*=\s*'(\s*(?:javascript|vbscript|data):[^']*)'/gi, (m, attr, val) =>
      /^\s*data:image\//i.test(val) ? m : ` ${attr}="#"`,
    )
}

/**
 * Preview dokumen mahasiswa untuk DITAMPILKAN LANGSUNG di browser (tanpa download).
 * - DOCX  -> dikonversi ke HTML (mammoth) lalu disanitasi -> { kind:"html", html }
 * - PDF   -> { kind:"pdf" } (klien menampilkannya via <iframe ...?inline=1>)
 * - .doc lama / lainnya -> { kind:"unsupported" }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAuth(request)
    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: { select: { id: true, instructorId: true } } },
    })
    if (!submission || !submission.documentUrl || !submission.fileName) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 })
    }

    const isOwner = submission.userId === auth.userId
    const isAssignedInstructor =
      auth.role === "INSTRUCTOR" && submission.user.instructorId === auth.userId
    const isAdmin = auth.role === "ADMIN"
    if (!isOwner && !isAssignedInstructor && !isAdmin) {
      throw new AuthError("Forbidden", 403)
    }

    const ext = path.extname(submission.fileName).toLowerCase()
    const mime = submission.fileMimeType || ""

    if (ext === ".pdf" || mime === "application/pdf") {
      return NextResponse.json({ kind: "pdf" })
    }

    if (ext === ".docx" || mime.includes("wordprocessingml")) {
      const file = await readStoredFile(submission.documentUrl)
      if (!file) {
        return NextResponse.json(
          { error: "File dokumen tidak ada di penyimpanan server ini." },
          { status: 410 },
        )
      }
      try {
        const { value } = await mammoth.convertToHtml({ buffer: file.data })
        return NextResponse.json({ kind: "html", html: sanitizeHtml(value) })
      } catch {
        return NextResponse.json(
          { error: "Dokumen tidak bisa dibaca (mungkin rusak atau bukan DOCX valid)." },
          { status: 422 },
        )
      }
    }

    return NextResponse.json({ kind: "unsupported", ext: ext || null })
  } catch (error) {
    return handleAuthError(error)
  }
}

