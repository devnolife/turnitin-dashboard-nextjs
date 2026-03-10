"use client"

export function StudentActivityTab() {
  return (
    <div className="rounded-md border overflow-x-auto">
      <div className="p-4">
        <h3 className="text-lg font-medium">Log Aktivitas</h3>
        <p className="text-sm text-muted-foreground">Aktivitas terbaru dan interaksi sistem</p>
      </div>

      <div className="border-t">
        <div className="divide-y">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">
                  {
                    [
                      "Masuk ke sistem",
                      "Melihat panduan pengajuan",
                      "Mengunduh umpan balik",
                      "Memperbarui informasi profil",
                    ][i]
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {
                    [
                      "Hari ini, 10:23",
                      "Kemarin, 15:45",
                      "3 hari lalu, 11:30",
                      "1 minggu lalu, 14:15",
                    ][i]
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
