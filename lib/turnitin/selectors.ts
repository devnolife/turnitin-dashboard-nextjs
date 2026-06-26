/**
 * URL & selector Turnitin — DIVERIFIKASI dari run discovery nyata
 * (akun instruktur, Quick Submit, www.turnitin.com — Okt 2026).
 *
 * Bila bot gagal di langkah tertentu setelah UI Turnitin berubah, perbaiki di
 * file INI saja. Lihat artefak discovery di uploads/.turnitin/discover/.
 *
 * Alur Quick Submit yang terpetakan:
 *   /login_page.asp                 → form login (#email, #password)
 *   /t_home.asp                     → instructor home (indikator: a.sn_quick_submit)
 *   a.sn_quick_submit               → inbox quick submit (t_inbox.asp?aid=quicksubmit)
 *   a.submit_paper_button           → t_custom_search.asp (pilih search target)
 *   [centang compare_to_database, submit_papers_to=0(no repo)] → input[name=submit]
 *   /t_submit.asp                   → form upload (#author_first/#author_last/#title/userfile)
 *   #upload-btn → #confirm-btn      → digital receipt (submission selesai)
 *   inbox: td.or_report_cell a.or-link  → "N%" similarity
 */

export const TURNITIN_PATHS = {
  login: "/login_page.asp?lang=en_us",
  /** Instructor home (untuk akun instruktur). */
  home: "/t_home.asp",
} as const

export const LOGIN = {
  emailInput: '#email, input[name="email"]',
  passwordInput: '#password, input[name="user_password"]',
  submitButton: 'input[type="submit"][value="Log in"], input.submit[name="submit"]',
  /** Hanya muncul saat sudah login sebagai instruktur. */
  loggedInIndicator: "a.sn_quick_submit",
  twoFactorIndicator:
    ':text("verification code"), :text("two-factor"), :text("authenticator"), input[name="otp"]',
} as const

export const QUICK_SUBMIT = {
  /** Tab "Quick Submit" di header (juga indikator login). */
  quickSubmitTab: "a.sn_quick_submit",
  /** Tombol "Submit" di inbox → halaman custom search. */
  submitPaperButton: "a.submit_paper_button",

  // --- t_custom_search.asp ---
  compareCheckbox: 'input[name="compare_to_database"]',
  repositorySelect: 'select[name="submit_papers_to"]',
  /** value "0" = no repository, "1" = standard, "2" = institution. */
  repositoryNoRepoValue: "0",
  customSearchSubmit: 'input[name="submit"][type="submit"]',

  // --- t_submit.asp (form upload) ---
  authorFirst: "#author_first",
  authorLast: "#author_last",
  titleInput: "#title",
  fileInput: 'input[name="userfile"], #selected-file',
  uploadButton: "#upload-btn",
  confirmButton: "#confirm-btn",
  /** Tampil di state "digital receipt" setelah Confirm (tanda submit sukses). */
  digitalReceipt: "#close-btn, .state-digital-receipt",

  // --- inbox: baca similarity ---
  /**
   * Persentase similarity per baris paper. `span.or-percentage` berisi "N%" dan
   * HANYA muncul saat report SELESAI — saat masih diproses, elemen ini tidak ada,
   * sehingga polling otomatis menunggu sampai skor benar-benar tersedia.
   */
  originalityLink: "td.or_report_cell .or-percentage, td.or_report_cell a.or-link",
  /**
   * Header kolom "Paper ID" (link sort). Inbox Quick Submit ber-PAGINASI & default
   * sort-nya bukan berdasarkan waktu, sehingga paper yang BARU dikirim sering tidak
   * ada di halaman 1. Mengklik header ini mengurutkan berdasarkan paper id; karena
   * paper id monoton naik, urutan DESCENDING menaruh submission terbaru di halaman 1.
   * Header bersifat toggle (klik=asc, klik lagi=desc).
   */
  paperIdSortHeader: 'th a:has-text("Paper ID")',
} as const
