"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ROLES } from "@/lib/rbac"

export async function authenticateUser(formData: FormData) {
  const email = formData.get("email")
  const password = formData.get("password")

  let assignedRole = null

  // --- ENVIRONMENT BASED AUTHENTICATION ---
  if (
    email === process.env.FOUNDER_EMAIL &&
    password === process.env.FOUNDER_PASSWORD
  ) {
    assignedRole = ROLES.SUPER_ADMIN
  } else if (
    email === process.env.MOD_EMAIL &&
    password === process.env.MOD_PASSWORD
  ) {
    assignedRole = ROLES.MODERATOR
  } else {
    return { error: "Invalid credentials or unauthorized access." }
  }

  const cookieStore = await cookies()

  cookieStore.set({
    name: "user_role",
    value: assignedRole,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  redirect("/admin")
}

export async function logoutUser() {
  const cookieStore = await cookies()

  // Wipe the session cookie
  cookieStore.delete("user_role")

  // Force redirect to login page
  redirect("/login")
}
