import ExcelJS from "exceljs"
import type { RekapBundle } from "./build-rekap"

const idDate = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const HEADER_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFDDE9FF" } }
const SUBHEADER_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFEEF3FF" } }
const TOTAL_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF1F5F9" } }

const THIN: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FF9CA3AF" } },
  bottom: { style: "thin", color: { argb: "FF9CA3AF" } },
  left: { style: "thin", color: { argb: "FF9CA3AF" } },
  right: { style: "thin", color: { argb: "FF9CA3AF" } },
}

function bordered(cell: ExcelJS.Cell) {
  cell.border = THIN
  cell.alignment = { vertical: "middle", wrapText: true, ...cell.alignment }
}

export async function generateRekapWorkbook(bundle: RekapBundle): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Perpusmu"
  wb.created = new Date()
  const ws = wb.addWorksheet("Sheet1")

  ws.columns = [
    { width: 5 }, { width: 24 }, { width: 14 }, { width: 36 }, { width: 22 },
    { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 8 },
    { width: 14 }, { width: 22 }, { width: 18 }, { width: 14 },
  ]

  ws.mergeCells("A1:N1")
  ws.getCell("A1").value = "DAFTAR HASIL PLAGIAT (TURNITIN) MAHASISWA"
  ws.getCell("A1").font = { bold: true, size: 14 }
  ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" }

  ws.mergeCells("A2:N2")
  ws.getCell("A2").value = "UNIVERSITAS MUHAMMADIYAH MAKASSAR"
  ws.getCell("A2").font = { bold: true, size: 12 }
  ws.getCell("A2").alignment = { horizontal: "center", vertical: "middle" }

  ws.mergeCells("A3:N3")
  ws.getCell("A3").value = `Periode: ${bundle.periode.label}`
  ws.getCell("A3").font = { italic: true }
  ws.getCell("A3").alignment = { horizontal: "center" }

  const headerRow = 5
  const subHeaderRow = 6
  const dataStartRow = 7

  ws.getRow(headerRow).height = 28
  ws.getRow(subHeaderRow).height = 22

  const topHeaders: Array<[string, string, string]> = [
    ["A", "A", "NO."],
    ["B", "B", "NAMA"],
    ["C", "C", "NIM"],
    ["D", "D", "JUDUL SKRIPSI"],
    ["E", "E", "JURUSAN"],
    ["F", "J", "TAHAP"],
    ["K", "K", "KET."],
    ["L", "L", "INSTRUKTUR"],
    ["M", "M", "TANGGAL PEMBAYARAN"],
    ["N", "N", "BANK"],
  ]
  for (const [c1, c2, label] of topHeaders) {
    const range = `${c1}${headerRow}:${c2}${subHeaderRow}`
    if (c1 === c2 && !["F", "K"].includes(c1)) {
      ws.mergeCells(range)
    } else if (c1 !== c2) {
      ws.mergeCells(`${c1}${headerRow}:${c2}${headerRow}`)
    }
    const cell = ws.getCell(`${c1}${headerRow}`)
    cell.value = label
    cell.font = { bold: true }
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
    cell.fill = HEADER_FILL
  }
  ws.mergeCells(`K${headerRow}:K${headerRow}`)
  const subHeaders = ["PROPOSAL", "HASIL", "TUTUP", "SKRIPSI/KTI", "dll"]
  const subCols = ["F", "G", "H", "I", "J"]
  subCols.forEach((col, i) => {
    const c = ws.getCell(`${col}${subHeaderRow}`)
    c.value = subHeaders[i]
    c.font = { bold: true, size: 10 }
    c.alignment = { horizontal: "center", vertical: "middle" }
    c.fill = SUBHEADER_FILL
  })
  const hargaCell = ws.getCell(`K${subHeaderRow}`)
  hargaCell.value = "HARGA"
  hargaCell.font = { bold: true, size: 10 }
  hargaCell.alignment = { horizontal: "center", vertical: "middle" }
  hargaCell.fill = SUBHEADER_FILL
  ws.mergeCells(`K${headerRow}:K${headerRow}`)
  ws.getCell(`K${headerRow}`).value = "KET."

  for (let r = headerRow; r <= subHeaderRow; r++) {
    for (let c = 1; c <= 14; c++) {
      bordered(ws.getCell(r, c))
    }
  }

  bundle.items.forEach((it, i) => {
    const row = ws.getRow(dataStartRow + i)
    row.getCell(1).value = it.no
    row.getCell(2).value = it.nama
    row.getCell(3).value = it.nim
    row.getCell(4).value = it.judulSkripsi
    row.getCell(5).value = it.jurusan
    const scoreText = it.similarityScore != null ? `${Math.round(it.similarityScore)}%` : "✓"
    if (it.examType === "PROPOSAL_DEFENSE") row.getCell(6).value = scoreText
    else if (it.examType === "RESULTS_DEFENSE") row.getCell(7).value = scoreText
    else if (it.examType === "FINAL_DEFENSE") row.getCell(8).value = scoreText
    else row.getCell(10).value = scoreText
    row.getCell(11).value = it.biaya
    row.getCell(11).numFmt = '"Rp"#,##0'
    row.getCell(12).value = it.instruktur
    row.getCell(13).value = it.tanggalPembayaran ? idDate.format(new Date(it.tanggalPembayaran)) : "-"
    row.getCell(14).value = it.namaBank
    for (let c = 1; c <= 14; c++) {
      bordered(row.getCell(c))
      if (c >= 6 && c <= 10) row.getCell(c).alignment = { horizontal: "center", vertical: "middle" }
      if (c === 1) row.getCell(c).alignment = { horizontal: "center", vertical: "middle" }
      if (c === 11) row.getCell(c).alignment = { horizontal: "right", vertical: "middle" }
    }
  })

  const totalRow = dataStartRow + Math.max(bundle.items.length, 0)
  ws.mergeCells(`A${totalRow}:J${totalRow}`)
  const jumlahLabel = ws.getCell(`A${totalRow}`)
  jumlahLabel.value = "JUMLAH"
  jumlahLabel.font = { bold: true }
  jumlahLabel.alignment = { horizontal: "right", vertical: "middle" }
  jumlahLabel.fill = TOTAL_FILL
  const jumlahCell = ws.getCell(`K${totalRow}`)
  jumlahCell.value = bundle.totals.biaya
  jumlahCell.numFmt = '"Rp"#,##0'
  jumlahCell.font = { bold: true }
  jumlahCell.fill = TOTAL_FILL
  jumlahCell.alignment = { horizontal: "right", vertical: "middle" }
  for (let c = 1; c <= 14; c++) bordered(ws.getCell(totalRow, c))

  const gap = 3
  const titleRow = totalRow + gap
  ws.mergeCells(`A${titleRow}:G${titleRow}`)
  ws.getCell(`A${titleRow}`).value = "REKAP PLAGIASI (TURNITIN)"
  ws.getCell(`A${titleRow}`).font = { bold: true, size: 14 }
  ws.getCell(`A${titleRow}`).alignment = { horizontal: "center" }

  const monthRow = titleRow + 1
  ws.mergeCells(`A${monthRow}:G${monthRow}`)
  ws.getCell(`A${monthRow}`).value = bundle.periode.label
  ws.getCell(`A${monthRow}`).font = { italic: true }
  ws.getCell(`A${monthRow}`).alignment = { horizontal: "center" }

  const recapHeaderRow = monthRow + 2
  const recapHeaders = ["NO", "INSTRUKTUR", "S1 (Rp.50.000)", "S2 (Rp.75.000)", "S3 (Rp.100.000)", "JUMLAH", "TOTAL"]
  recapHeaders.forEach((h, i) => {
    const c = ws.getCell(recapHeaderRow, i + 1)
    c.value = h
    c.font = { bold: true }
    c.alignment = { horizontal: "center", vertical: "middle" }
    c.fill = HEADER_FILL
    bordered(c)
  })

  bundle.rekap.forEach((r, i) => {
    const row = ws.getRow(recapHeaderRow + 1 + i)
    row.getCell(1).value = i + 1
    row.getCell(2).value = r.instruktur
    row.getCell(3).value = r.totalS1
    row.getCell(4).value = r.totalS2
    row.getCell(5).value = r.totalS3
    row.getCell(6).value = r.jumlah
    row.getCell(7).value = r.total
    row.getCell(7).numFmt = '"Rp"#,##0'
    for (let c = 1; c <= 7; c++) {
      bordered(row.getCell(c))
      row.getCell(c).alignment = { vertical: "middle", horizontal: c === 2 ? "left" : c === 7 ? "right" : "center" }
    }
  })

  const recapTotalsRow = recapHeaderRow + 1 + bundle.rekap.length
  ws.getCell(recapTotalsRow, 2).value = "TOTAL"
  const sums = bundle.rekap.reduce(
    (acc, r) => ({
      s1: acc.s1 + r.totalS1,
      s2: acc.s2 + r.totalS2,
      s3: acc.s3 + r.totalS3,
      jumlah: acc.jumlah + r.jumlah,
      total: acc.total + r.total,
    }),
    { s1: 0, s2: 0, s3: 0, jumlah: 0, total: 0 },
  )
  ws.getCell(recapTotalsRow, 3).value = sums.s1
  ws.getCell(recapTotalsRow, 4).value = sums.s2
  ws.getCell(recapTotalsRow, 5).value = sums.s3
  ws.getCell(recapTotalsRow, 6).value = sums.jumlah
  ws.getCell(recapTotalsRow, 7).value = sums.total
  ws.getCell(recapTotalsRow, 7).numFmt = '"Rp"#,##0'
  for (let c = 1; c <= 7; c++) {
    const cell = ws.getCell(recapTotalsRow, c)
    cell.font = { bold: true }
    cell.fill = TOTAL_FILL
    bordered(cell)
    cell.alignment = { vertical: "middle", horizontal: c === 2 ? "right" : c === 7 ? "right" : "center" }
  }

  const arrayBuffer = await wb.xlsx.writeBuffer()
  return Buffer.from(arrayBuffer)
}
