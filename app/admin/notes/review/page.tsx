"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Layers,
  Zap,
  BookText,
  Inbox,
} from "lucide-react"
import { getPendingNotes, batchApproveModule } from "@/app/actions/notes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Link from "next/link"

export default function NotesReviewQueue() {
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAndGroup = async () => {
    setIsLoading(true)
    const response = await getPendingNotes()
    if (response.success) {
      const grouped = response.notes.reduce((acc: any, note: any) => {
        const key = `${note.univ}-${note.subject}-${note.module}`
        if (!acc[key]) {
          acc[key] = {
            id: key,
            univ: note.univ,
            subject: note.subject,
            module: note.module,
            course: note.course,
            count: 0,
            items: [],
          }
        }
        acc[key].items.push(note)
        acc[key].count++
        return acc
      }, {})
      setGroups(Object.values(grouped))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchAndGroup()
  }, [])

  const handleBatchApprove = async (g: any) => {
    if (!confirm(`Authorize production for all ${g.count} topics?`)) return
    const res = await batchApproveModule(g.univ, g.course, g.subject, g.module)
    if (res.success) fetchAndGroup()
  }

  return (
    <div className="min-h-screen p-8 text-foreground">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header - Standard Professional */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Production Queue
            </h1>
            <p className="text-sm text-muted-foreground">
              Reviewing pending AI-shredded modules for Rivoa/Klaz.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchAndGroup}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Sync Queue
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Retrieving storage state...
            </span>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No modules currently awaiting authorization.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <Card
                key={g.id}
                className="border-border bg-card shadow-sm transition-all hover:ring-1 hover:ring-ring"
              >
                <CardHeader className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                      {g.univ}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal"
                    >
                      {g.count} Nodes
                    </Badge>
                  </div>
                  <h3 className="text-lg leading-none font-medium tracking-tight">
                    {g.subject}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    {g.course} • {g.module}
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-0">
                  <div className="space-y-2 border-t border-border py-4">
                    {g.items.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <BookText className="h-3.5 w-3.5 opacity-50" />
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {g.count > 3 && (
                      <p className="pl-6 text-[11px] text-muted-foreground/70 italic">
                        + {g.count - 3} additional items in module
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-3 border-t border-border p-5">
                  <Link
                    href={`/admin/notes/review/${g.items[0].id}`}
                    className="flex-1"
                  >
                    <Button variant="secondary" className="h-9 w-full text-xs">
                      Inspect
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleBatchApprove(g)}
                    className="h-9 flex-1 text-xs"
                  >
                    <Zap className="mr-2 h-3.5 w-3.5 fill-current" />
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
