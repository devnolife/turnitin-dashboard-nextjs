// PM2 process manager — menjaga worker otomasi Turnitin tetap hidup.
//
// Worker ini WAJIB berjalan terus-menerus: Next.js hanya memasukkan job ke
// antrian (tabel TurnitinJob), sedangkan proses INI yang benar-benar login ke
// Turnitin via Playwright dan mengupload dokumen. Tanpa worker yang hidup, file
// dari Next.js hanya menumpuk berstatus QUEUED dan tidak pernah diteruskan.
//
// Perintah cepat (lihat juga script di package.json):
//   npm run worker:start     # start worker (daemon, auto-restart kalau crash)
//   npm run worker:logs      # lihat log realtime
//   npm run worker:status    # status & uptime
//   npm run worker:restart   # restart
//   npm run worker:stop      # hentikan
//
// Agar otomatis hidup lagi SETELAH server reboot:
//   Linux / macOS : pm2 startup  →  jalankan perintah yang ditampilkan  →  pm2 save
//   Windows       : npm i -g pm2-windows-startup  &&  pm2-startup install  →  pm2 save
//
// Prasyarat sekali jalan: `npm run turnitin:bootstrap` agar sesi login Turnitin
// tersimpan (menangani 2FA bila ada).

const path = require("path")

module.exports = {
  apps: [
    {
      name: "turnitin-worker",
      // Jalankan script TypeScript lewat CLI tsx secara langsung (lintas-OS, tanpa
      // mengandalkan resolusi .bin yang sering bermasalah di Windows).
      script: path.join(__dirname, "node_modules", "tsx", "dist", "cli.mjs"),
      args: ["scripts/turnitin-worker.ts"],
      interpreter: "node",
      // cwd HARUS root proyek: loadEnv() & path penyimpanan (uploads/) relatif ke sini.
      cwd: __dirname,

      // Worker bersifat serial (1 job sekaligus) — cukup satu instance.
      instances: 1,
      exec_mode: "fork",

      // Auto-restart saat crash, dengan backoff agar tidak spam login ke Turnitin.
      autorestart: true,
      max_restarts: 50,
      restart_delay: 10000,
      exp_backoff_restart_delay: 5000,
      min_uptime: 30000,

      // Jangan restart hanya karena ada perubahan file.
      watch: false,
      // Restart bila memori membengkak (kebocoran dari Chromium yang lama hidup).
      max_memory_restart: "700M",

      time: true, // timestamp pada setiap baris log
      merge_logs: true,
      out_file: path.join(__dirname, "uploads", ".turnitin", "logs", "worker-out.log"),
      error_file: path.join(__dirname, "uploads", ".turnitin", "logs", "worker-err.log"),

      env: {
        NODE_ENV: "production",
      },
    },
  ],
}
