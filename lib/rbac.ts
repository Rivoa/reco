// lib/rbac.ts

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN", // You (Full God-mode)
  MODERATOR: "MODERATOR", // Verifies notes, manages standard users
  CONTENT_CREATOR: "CONTENT_CREATOR", // Uploads initial notes, restricted access
} as const

export type Role = keyof typeof ROLES

export const PERMISSIONS = {
  // 📊 Dashboard & Analytics
  VIEW_DASHBOARD: [ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.CONTENT_CREATOR],
  VIEW_ANALYTICS: [ROLES.SUPER_ADMIN, ROLES.MODERATOR],

  // 👥 User Management
  VIEW_USERS: [ROLES.SUPER_ADMIN, ROLES.MODERATOR],
  EDIT_USER_PROFILES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR], // e.g., fixing a typo in a name
  BAN_USER: [ROLES.SUPER_ADMIN, ROLES.MODERATOR], // Restricting app access
  DELETE_USER: [ROLES.SUPER_ADMIN], // Hard database delete

  // 📚 Content & Notes Lifecycle (The Verification Pipeline)
  UPLOAD_NOTES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.CONTENT_CREATOR],
  EDIT_OWN_NOTES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR, ROLES.CONTENT_CREATOR],
  EDIT_ANY_NOTES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR],
  APPROVE_NOTES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR], // Pushing notes to the live mobile app
  REJECT_NOTES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR], // Sending back to content creators
  DELETE_NOTES: [ROLES.SUPER_ADMIN, ROLES.MODERATOR], // Removing live/pending content

  // 🎮 Gamification Controls
  VIEW_LEADERBOARD_DATA: [ROLES.SUPER_ADMIN, ROLES.MODERATOR],
  RESET_USER_XP: [ROLES.SUPER_ADMIN], // Destructive action, restricted to you
  EDIT_XP_MULTIPLIERS: [ROLES.SUPER_ADMIN], // Changing how much XP notes/quizzes give

  // ⚙️ System Settings
  MANAGE_APP_BANNERS: [ROLES.SUPER_ADMIN, ROLES.MODERATOR], // Announcements on the mobile home screen
  MANAGE_ROLES: [ROLES.SUPER_ADMIN], // Promoting a Content Creator to Moderator
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(userRole: Role, action: Permission): boolean {
  // Safety fallback in case an undefined role is passed
  if (!userRole || !action || !PERMISSIONS[action]) {
    return false
  }

  return (PERMISSIONS[action] as readonly Role[]).includes(userRole)
}
