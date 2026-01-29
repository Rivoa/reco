import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. If no user, show the public landing page or login
  if (!user) {
    // return <PublicLandingPage />; 
    // OR
    redirect('/login');
  }

  // 2. Fetch the role to decide where they go
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 3. RBAC Dispatch Logic
  const role = profile?.role?.toLowerCase();

  if (role === 'admin') redirect('/overview');
  if (role === 'developer') redirect('/developer');
  if (role === 'moderator') redirect('/content');

  // 4. Default fallback for standard users
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <p className="text-zinc-500 text-sm font-mono">Redirecting to workspace...</p>
    </div>
  );
}