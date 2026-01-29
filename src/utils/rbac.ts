import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Valid roles for the Standalone Engine
 */
export type UserRole = 'admin' | 'developer' | 'moderator' | 'user';

/**
 * checkRole
 * The primary guard for Server Components and Route Handlers.
 * If the user lacks the required role, it triggers a server-side redirect.
 */
export async function checkRole(requiredRole: UserRole | UserRole[]) {
  const supabase = await createClient();

  // 1. Get the authenticated user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch the role from our custom public.profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // If no profile exists, sign them out and redirect
    await supabase.auth.signOut();
    redirect("/login");
  }

  // 3. Authorization Check
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  if (!allowedRoles.includes(profile.role)) {
    // If they have a session but wrong role, send them to unauthorized or home
    redirect("/");
  }

  return { user, profile: profile as { id: string; email: string; role: UserRole } };
}

/**
 * getSessionRole
 * Non-blocking utility to get the role without triggering a redirect.
 * Useful for building the Sidebar or header components.
 */
export async function getSessionRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role || null;
  } catch {
    return null;
  }
}