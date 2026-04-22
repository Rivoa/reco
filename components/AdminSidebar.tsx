"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  TerminalSquare,
  UploadCloud,
  CheckCircle,
  LogOut,
  Loader2,
} from "lucide-react"
import { RoleGate } from "@/components/RoleGate"
import { Role } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/app/actions/auth"

export function AdminSidebar({ userRole }: { userRole: Role }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } catch (error) {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b border-border px-5">
        <TerminalSquare className="h-6 w-6 flex-shrink-0 text-primary" />
        <span
          className={`ml-3 font-bold tracking-widest text-foreground transition-opacity duration-300 ${
            isCollapsed ? "hidden opacity-0" : "opacity-100"
          }`}
        >
          KLAZ
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-3">
        <Link
          href="/admin"
          className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive("/admin")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Dashboard</span>}
        </Link>

        {/* Content Pipeline Section */}
        <RoleGate userRole={userRole} permission="APPROVE_NOTES">
          <div
            className={`mt-4 mb-2 px-3 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase ${
              isCollapsed ? "text-center" : ""
            }`}
          >
            {isCollapsed ? "—" : "Content"}
          </div>

          <Link
            href="/admin/notes"
            className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/admin/notes")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <UploadCloud className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Upload Notes</span>}
          </Link>

          <Link
            href="/admin/notes/review"
            className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive("/admin/notes/review")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Note Approval</span>}
          </Link>
        </RoleGate>

        {/* Logout Action */}
        <div className="mt-4 border-t border-border/50 pt-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {isLoggingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5 flex-shrink-0" />
            )}
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </nav>

      {/* User Session Footer */}
      <div className="border-t border-border p-4">
        <div
          className={`flex flex-col overflow-hidden transition-opacity duration-300 ${
            isCollapsed ? "items-center" : ""
          }`}
        >
          {!isCollapsed && (
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Active Session
            </span>
          )}
          <span className="truncate font-mono text-xs text-foreground">
            {isCollapsed ? userRole[0] : userRole}
          </span>
        </div>
      </div>

      {/* Retract Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-12 -right-4 z-50 h-8 w-8 rounded-full border border-border bg-background shadow-sm hover:bg-accent"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  )
}
