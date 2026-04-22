import { cookies } from "next/headers"
import Link from "next/link"
import { RoleGate } from "@/components/RoleGate"
import { Role } from "@/lib/rbac"
import { getLiveDashboardStats } from "@/app/actions/dashboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Clock,
  CheckCircle2,
  School,
  BookOpen,
  Users,
  AlertCircle,
  Activity,
  ArrowRight,
} from "lucide-react"

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const userRole = (cookieStore.get("user_role")?.value as Role) || "USER"

  const statsRes = await getLiveDashboardStats()

  if (!statsRes.success || !statsRes.kpis) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 p-8">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-medium text-muted-foreground">
          Failed to load live database metrics.
        </p>
      </div>
    )
  }

  const { kpis, byUniversity, byDepartment, recentNotes } = statsRes

  return (
    <div className="flex flex-col space-y-8 bg-background p-8 text-foreground">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          System Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live monitoring from Firestore database.
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total Notes
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalNotes}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Verification Queue
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.pendingNotes}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting admin approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Connecting to Users...
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Approved Notes
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.approvedNotes}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Live on the platform
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* University Distribution */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Notes by University</CardTitle>
            </div>
            <CardDescription>
              Content distribution across supported institutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {byUniversity?.map((univ) => (
              <div key={univ.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {univ.name}
                  </span>
                  <span className="text-muted-foreground">
                    {univ.count} notes
                  </span>
                </div>
                <Progress
                  value={univ.percentage}
                  className="h-2 bg-muted [&>div]:bg-primary"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Top Departments</CardTitle>
            </div>
            <CardDescription>
              Highest contributing engineering branches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {byDepartment?.map((dept) => (
                <div
                  key={dept.name}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {dept.name}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
            </div>
            <Link
              href="/admin/notes/review"
              className="flex items-center text-sm font-medium text-primary hover:underline"
            >
              View Queue <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentNotes?.map((note) => (
              <div
                key={note.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded bg-muted p-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
                      {note.title}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-primary">
                        {note.univ}
                      </span>
                      <span>•</span>
                      <span>{note.subject}</span>
                      <span>•</span>
                      <span>Module {note.module.replace("M", "")}</span>
                    </div>
                  </div>
                </div>
                <div>
                  {note.isApproved ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                    >
                      Approved
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-600"
                    >
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {recentNotes?.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent notes found in the database.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
