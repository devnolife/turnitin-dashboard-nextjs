"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CircleDollarSign, Loader2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DashboardMainCard } from "@/components/dashboard/main-card"
import api from "@/lib/api/client"

type Tier = {
  degree: "S1" | "S2" | "S3"
  studentRate: number
  instructorRate: number
}

const DEGREES: Array<Tier["degree"]> = ["S1", "S2", "S3"]
const DEGREE_LABELS: Record<Tier["degree"], string> = {
  S1: "Strata 1 (Sarjana)",
  S2: "Strata 2 (Magister)",
  S3: "Strata 3 (Doktor)",
}

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

export default function AdminPricingPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    api
      .get("/admin/settings/pricing")
      .then((res) => {
        const list: Tier[] = res.data?.tiers || []
        const byDegree = new Map(list.map((t) => [t.degree, t]))
        const ordered = DEGREES.map(
          (d) =>
            byDegree.get(d) || {
              degree: d,
              studentRate: 0,
              instructorRate: 0,
            },
        )
        setTiers(ordered)
      })
      .catch(() => setMessage({ type: "error", text: "Gagal memuat tarif" }))
      .finally(() => setLoading(false))
  }, [])

  const updateTier = (degree: Tier["degree"], field: "studentRate" | "instructorRate", value: string) => {
    const num = value.replace(/[^\d]/g, "")
    setTiers((prev) =>
      prev.map((t) => (t.degree === degree ? { ...t, [field]: Number(num) || 0 } : t)),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await api.put("/admin/settings/pricing", { tiers })
      setTiers(res.data?.tiers || tiers)
      setMessage({ type: "success", text: res.data?.message || "Tarif berhasil disimpan" })
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setMessage({ type: "error", text: errorMsg || "Gagal menyimpan tarif" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardMainCard
      title="Tarif Pembayaran"
      subtitle="Atur tarif mahasiswa dan honor instruktur per strata 💰"
      icon={CircleDollarSign}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/settings">
            <ArrowLeft className="mr-2 size-4" /> Kembali ke Pengaturan
          </Link>
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-2xl border p-4 text-sm ${
            message.type === "success"
              ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/30 dark:text-green-200"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/30 dark:text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Tarif per Strata</CardTitle>
              <CardDescription>
                <span className="font-medium">Tarif Mahasiswa</span> = biaya yang dibayar mahasiswa untuk cek
                Turnitin. <span className="font-medium">Honor Instruktur</span> = jumlah yang masuk ke total
                rekap honor instruktur per submission yang ditangani.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {tiers.map((tier) => (
                <div
                  key={tier.degree}
                  className="grid gap-4 rounded-2xl border border-border p-4 md:grid-cols-[160px_1fr_1fr] md:items-end"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                      {tier.degree}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{DEGREE_LABELS[tier.degree]}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`student-${tier.degree}`}>Tarif Mahasiswa (Rp)</Label>
                    <Input
                      id={`student-${tier.degree}`}
                      inputMode="numeric"
                      value={String(tier.studentRate)}
                      onChange={(e) => updateTier(tier.degree, "studentRate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{formatRupiah(tier.studentRate)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`instructor-${tier.degree}`}>Honor Instruktur (Rp)</Label>
                    <Input
                      id={`instructor-${tier.degree}`}
                      inputMode="numeric"
                      value={String(tier.instructorRate)}
                      onChange={(e) => updateTier(tier.degree, "instructorRate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{formatRupiah(tier.instructorRate)}</p>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving || loading}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 size-4" /> Simpan Tarif
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Catatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Tarif berlaku langsung setelah disimpan untuk perhitungan rekap & ekspor Excel berikutnya.
          </p>
          <p>
            • Untuk submission yang sudah memiliki Payment dengan amount eksplisit, kolom <span className="font-medium">Harga</span> di rekap memakai amount Payment tersebut. Tarif default hanya dipakai sebagai fallback.
          </p>
          <p>
            • Honor instruktur selalu memakai tarif default per strata (bukan amount Payment).
          </p>
        </CardContent>
      </Card>
    </DashboardMainCard>
  )
}
