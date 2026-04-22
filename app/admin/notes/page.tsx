"use client"

import { useState, useEffect } from "react"
import { PDFDocument } from "pdf-lib"
import {
  FileText,
  UploadCloud,
  FileType,
  CheckCircle2,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BOUNCER_URL =
  "https://quiet-firefly-2e28.admin-011-d36.workers.dev/generate-upload-url"
const ADMIN_ORIGIN = "https://admin.rivoa.in"

const UNIV_PROGRAM_MAP: Record<string, string[]> = {
  KTU: ["BTECH", "MTECH", "BARCH", "MCA", "MBA"],
  CUSAT: ["BTECH", "MTECH", "MCA", "MBA", "BSC", "MSC"],
  MGU: ["BA", "BSC", "BCOM", "BCA", "BBA", "MA", "MSC", "MCOM", "MCA", "MBA"],
  CU: ["BA", "BSC", "BCOM", "BCA", "BBA", "MA", "MSC", "MCOM", "MCA", "MBA"],
}

const PROGRAM_LABELS: Record<string, string> = {
  BTECH: "B.Tech",
  MTECH: "M.Tech",
  BARCH: "B.Arch",
  BA: "B.A",
  BSC: "B.Sc",
  BCOM: "B.Com",
  BCA: "BCA",
  BBA: "BBA",
  MA: "M.A",
  MSC: "M.Sc",
  MCOM: "M.Com",
  MCA: "MCA",
  MBA: "MBA",
}

export default function NotesUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Form Fields
  const [univ, setUniv] = useState("KTU")
  const [course, setCourse] = useState("BTECH")
  const [revision, setRevision] = useState("2024")
  const [dept, setDept] = useState("CSE")
  const [sem, setSem] = useState("S4")
  const [module, setModule] = useState("M1")
  const [subject, setSubject] = useState("")

  // Status Fields
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState("")

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!UNIV_PROGRAM_MAP[univ].includes(course)) {
      setCourse(UNIV_PROGRAM_MAP[univ][0])
    }
  }, [univ, course])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComplete) return
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreviewUrl(null)
    setSubject("")
    setIsComplete(false)
    setProgress(0)
    setStatusText("")
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !subject || isComplete) return

    setIsUploading(true)
    setProgress(0)

    try {
      setStatusText("Preparing file and splitting pages...")
      const arrayBuffer = await file.arrayBuffer()
      const originalPdf = await PDFDocument.load(arrayBuffer)
      const totalPages = originalPdf.getPageCount()
      const baseName = file.name.replace(/\.[^/.]+$/, "")

      const chunkSize = 4
      const chunkCount = Math.ceil(totalPages / chunkSize)

      for (let i = 0; i < totalPages; i += chunkSize) {
        const currentChunkIndex = Math.floor(i / chunkSize) + 1
        setStatusText(`Uploading part ${currentChunkIndex} of ${chunkCount}...`)

        const chunkPdf = await PDFDocument.create()
        const pageIndices = []
        for (let j = i; j < i + chunkSize && j < totalPages; j++) {
          pageIndices.push(j)
        }
        const copiedPages = await chunkPdf.copyPages(originalPdf, pageIndices)
        copiedPages.forEach((page) => chunkPdf.addPage(page))

        const chunkBytes = await chunkPdf.save()
        const chunkBlob = new Blob([chunkBytes], { type: "application/pdf" })

        const bouncerRes = await fetch(BOUNCER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Origin: ADMIN_ORIGIN },
          body: JSON.stringify({
            fileName: `${baseName}_part${currentChunkIndex}.pdf`,
            univ,
            course,
            revision,
            dept,
            sem,
            subject,
            module,
            chunkIndex: currentChunkIndex.toString(),
          }),
        })

        if (!bouncerRes.ok) throw new Error("Connection failed")
        const { uploadUrl } = await bouncerRes.json()

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/pdf" },
          body: chunkBlob,
        })

        if (!uploadRes.ok)
          throw new Error(`Upload failed at section ${currentChunkIndex}`)

        setProgress(Math.round((currentChunkIndex / chunkCount) * 100))
      }

      setStatusText("Upload complete. Notes are now being processed.")
      setIsComplete(true)
      setIsUploading(false)
    } catch (error: any) {
      console.error(error)
      setStatusText(`Error: ${error.message}`)
      setIsUploading(false)
    }
  }

  return (
    <div className="flex h-full flex-col space-y-4 p-8 text-foreground">
      <div className="flex-none">
        <h1 className="text-2xl font-semibold tracking-tight">Upload Notes</h1>
        <p className="text-sm text-muted-foreground">
          Add new study materials to the library.
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Form Panel */}
        <div className="flex flex-col xl:col-span-4 2xl:col-span-3">
          <Card className="flex flex-1 flex-col rounded-none border-border bg-card">
            <CardHeader className="flex-none border-b border-border py-4">
              <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <FileText className="h-4 w-4" /> Note Information
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-5">
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Drag and Drop Area */}
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading || isComplete}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                  <div
                    className={`flex flex-col items-center justify-center rounded-none border-2 border-dashed border-border p-6 transition-all ${isComplete ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  >
                    {isComplete ? (
                      <>
                        <CheckCircle2 className="mb-2 h-8 w-8 text-primary" />
                        <span className="text-xs font-semibold">
                          Upload Finished
                        </span>
                      </>
                    ) : file ? (
                      <>
                        <FileType className="mb-2 h-8 w-8 text-foreground" />
                        <span className="w-full truncate px-4 text-center text-xs font-medium">
                          {file.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Select PDF file
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        University
                      </Label>
                      <Select
                        value={univ}
                        onValueChange={setUniv}
                        disabled={isUploading || isComplete}
                      >
                        <SelectTrigger className="h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {Object.keys(UNIV_PROGRAM_MAP).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Course
                      </Label>
                      <Select
                        value={course}
                        onValueChange={setCourse}
                        disabled={isUploading || isComplete}
                      >
                        <SelectTrigger className="h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {UNIV_PROGRAM_MAP[univ].map((prog) => (
                            <SelectItem key={prog} value={prog}>
                              {PROGRAM_LABELS[prog]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Scheme
                      </Label>
                      <Select
                        value={revision}
                        onValueChange={setRevision}
                        disabled={isUploading || isComplete}
                      >
                        <SelectTrigger className="h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="2024">2024 Rev</SelectItem>
                          <SelectItem value="2019">2019 Rev</SelectItem>
                          <SelectItem value="NA">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Department
                      </Label>
                      <Select
                        value={dept}
                        onValueChange={setDept}
                        disabled={isUploading || isComplete}
                      >
                        <SelectTrigger className="h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {["CSE", "ECE", "MECH", "CE", "EEE", "GENERAL"].map(
                            (d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Semester
                      </Label>
                      <Select
                        value={sem}
                        onValueChange={setSem}
                        disabled={isUploading || isComplete}
                      >
                        <SelectTrigger className="h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"].map(
                            (s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                        Module
                      </Label>
                      <Select
                        value={module}
                        onValueChange={setModule}
                        disabled={isUploading || isComplete}
                      >
                        <SelectTrigger className="h-9 rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {["M1", "M2", "M3", "M4", "M5", "M6", "FULL"].map(
                            (m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="subject"
                      className="text-[10px] font-bold text-muted-foreground uppercase"
                    >
                      Subject Name
                    </Label>
                    <Input
                      id="subject"
                      placeholder="e.g. Operating Systems"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="h-9 rounded-none"
                      disabled={isUploading || isComplete}
                    />
                  </div>
                </div>

                {(isUploading || isComplete) && (
                  <div className="space-y-2 rounded-none border border-border bg-muted/30 p-4">
                    <div className="flex justify-between text-[10px] font-bold tracking-tight uppercase">
                      <span className="flex items-center gap-2">
                        {isComplete ? (
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                        ) : (
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        )}
                        {statusText}
                      </span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1 rounded-none" />
                  </div>
                )}

                {isComplete ? (
                  <Button
                    type="button"
                    onClick={resetForm}
                    variant="outline"
                    className="h-11 w-full rounded-none"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Upload Another File
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isUploading || !file}
                    className="h-11 w-full rounded-none"
                  >
                    {isUploading ? "Uploading..." : "Start Upload"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-8 2xl:col-span-9">
          <Card className="flex h-[calc(100vh-12rem)] min-h-[600px] flex-col overflow-hidden rounded-none border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Document Preview
              </span>
              {file && (
                <span className="max-w-[300px] truncate text-[10px] text-muted-foreground">
                  {file.name}
                </span>
              )}
            </div>

            <div className="relative flex-1 bg-muted/10">
              {previewUrl ? (
                <iframe
                  src={`${previewUrl}#toolbar=0`}
                  className="absolute inset-0 h-full w-full border-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <FileText className="mb-3 h-12 w-12 opacity-20" />
                  <p className="text-[10px] font-bold tracking-widest uppercase">
                    No file selected
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
