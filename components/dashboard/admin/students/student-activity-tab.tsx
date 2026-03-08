"use client"

export function StudentActivityTab() {
  return (
    <div className="rounded-md border overflow-x-auto">
      <div className="p-4">
        <h3 className="text-lg font-medium">Activity Log</h3>
        <p className="text-sm text-muted-foreground">Recent activity and system interactions</p>
      </div>

      <div className="border-t">
        <div className="divide-y">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">
                  {
                    [
                      "Logged in",
                      "Viewed submission guidelines",
                      "Downloaded feedback",
                      "Updated profile information",
                    ][i]
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {
                    [
                      "Today, 10:23 AM",
                      "Yesterday, 3:45 PM",
                      "3 days ago, 11:30 AM",
                      "1 week ago, 2:15 PM",
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
