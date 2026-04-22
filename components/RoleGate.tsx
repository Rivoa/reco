import { hasPermission, Permission, Role } from "@/lib/rbac"

interface RoleGateProps {
  userRole: Role
  permission: Permission
  children: React.ReactNode
}

export function RoleGate({ userRole, permission, children }: RoleGateProps) {
  if (!hasPermission(userRole, permission)) {
    return null
  }

  return <>{children}</>
}
