"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Loader2,
  LayoutList,
  AlertCircle,
  BookOpen,
  FileText,
} from "lucide-react"
import {
  getPendingNotes,
  processNoteVerification,
  getNoteContentFromR2,
} from "@/app/actions/notes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Global session cache to prevent re-downloading during navigation
const noteContentCache: Record<string, string> = {}

export default function DetailedReviewPage() {
  const params = useParams()
  const router = useRouter()

  const [note, setNote] = useState<any>(null)
  const [moduleNotes, setModuleNotes] = useState<any[]>([]) // All notes in this module
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadDocument() {
      try {
        const res = await getPendingNotes()
        const found = res.notes?.find((n: any) => n.id === params.id)

        if (found) {
          setNote(found)

          // Find all other notes in the same subject and module, sort alphabetically
          const relatedNotes =
            res.notes
              ?.filter(
                (n: any) =>
                  n.subject === found.subject && n.module === found.module
              )
              .sort((a: any, b: any) => a.title.localeCompare(b.title)) || []

          setModuleNotes(relatedNotes)

          // 1. Check if we already downloaded this during the session
          if (noteContentCache[found.r2Path]) {
            setMarkdown(noteContentCache[found.r2Path])
            return
          }

          // 2. If not in cache, fetch from R2
          const mdRes = await getNoteContentFromR2(found.r2Path)

          if (mdRes.success) {
            noteContentCache[found.r2Path] = mdRes.content // Save to cache
            setMarkdown(mdRes.content)
          } else {
            setError(mdRes.error || "Failed to load document content.")
          }
        } else {
          setError("Document not found in the review queue.")
        }
      } catch (err) {
        setError("A network error occurred while loading the document.")
      }
    }

    // Reset markdown state when ID changes so it shows the loading state briefly
    setMarkdown(null)
    setError(null)
    loadDocument()
  }, [params.id])

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setIsProcessing(true)
    const res = await processNoteVerification(note.id, action)
    if (res.success) {
      // Find if there is a next note in the module list to automatically jump to
      const currentIndex = moduleNotes.findIndex((n) => n.id === note.id)
      const nextNote = moduleNotes[currentIndex + 1]

      if (nextNote) {
        router.push(`/admin/notes/review/${nextNote.id}`)
      } else {
        router.push("/admin/notes/review")
      }
    } else {
      setError("Failed to process the document. Please try again.")
      setIsProcessing(false)
    }
  }

  // Error State UI
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm font-medium text-foreground">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          Return to Queue
        </Button>
      </div>
    )
  }

  // Loading State UI
  if (!note) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading document details...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/notes/review")}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="max-w-[400px] truncate text-lg leading-none font-semibold">
              {note.title}
            </h1>
            <p className="mt-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {note.univ} • {note.subject} • Module{" "}
              {note.module?.replace("M", "") || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={isProcessing}
            onClick={() => handleAction("REJECT")}
          >
            <XCircle className="mr-2 h-4 w-4" /> Reject
          </Button>
          <Button
            size="sm"
            disabled={isProcessing || !markdown}
            onClick={() => handleAction("APPROVE")}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Approve Content
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Column: Module Topics Navigator */}
        <aside className="hidden w-64 flex-none border-r border-border bg-muted/10 md:block">
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-4">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-bold tracking-tight text-foreground uppercase">
                Module Topics
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-3">
                {moduleNotes.map((mNote, index) => {
                  const isActive = mNote.id === note.id
                  return (
                    <Link
                      key={mNote.id}
                      href={`/admin/notes/review/${mNote.id}`}
                    >
                      <div
                        className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs transition-colors ${
                          isActive
                            ? "bg-primary/10 font-semibold text-primary"
                            : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <FileText
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/50"}`}
                        />
                        <span className="line-clamp-2 leading-tight">
                          {mNote.title}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* Center Column: Markdown Reader */}
        <section className="relative flex-1 overflow-y-auto border-r border-border bg-background p-8 lg:p-12">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold tracking-tight uppercase"
              >
                Content Preview
              </Badge>
              <span className="text-[10px] font-medium text-muted-foreground">
                {moduleNotes.findIndex((n) => n.id === note.id) + 1} of{" "}
                {moduleNotes.length} Topics
              </span>
            </div>

            <article className="prose prose-zinc dark:prose-invert max-w-none">
              {markdown ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/5">
                  <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground/50" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Downloading document...
                  </p>
                </div>
              )}
            </article>
          </div>
        </section>

        {/* Right Column: Quiz Verification Sidebar */}
        <aside className="w-80 flex-none bg-muted/30 lg:w-96">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <LayoutList className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-bold tracking-tight uppercase">
                  Active Recall Quiz
                </h3>
              </div>

              <div className="space-y-5">
                {note.activeRecallQuiz?.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded bg-muted px-2 py-0.5 text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                        Question {i + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold"
                      >
                        {q.difficulty}
                      </Badge>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed font-semibold text-foreground">
                      {q.question}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt: string, oi: number) => {
                        const isCorrect = oi === parseInt(q.correctIndex)
                        return (
                          <div
                            key={oi}
                            className={`flex items-start gap-3 rounded-lg border p-3 text-xs ${
                              isCorrect
                                ? "border-primary/40 bg-primary/5 font-medium text-primary"
                                : "border-border bg-background text-muted-foreground"
                            }`}
                          >
                            <div
                              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isCorrect ? "bg-primary" : "bg-muted-foreground/20"}`}
                            />
                            <span>{opt}</span>
                          </div>
                        )
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 rounded-md border-l-2 border-border bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
                        <span className="mb-1 block text-[10px] font-bold uppercase">
                          Explanation:
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {(!note.activeRecallQuiz ||
                  note.activeRecallQuiz.length === 0) && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No quiz questions found for this document.
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </aside>
      </main>
    </div>
  )
}
