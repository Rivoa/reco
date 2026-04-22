import { cookies } from "next/headers"
import { Role } from "@/lib/rbac"
import { AdminSidebar } from "@/components/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userRole = (cookieStore.get("user_role")?.value as Role) || "USER"

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Client-Side Retractable Sidebar */}
      <AdminSidebar userRole={userRole} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
