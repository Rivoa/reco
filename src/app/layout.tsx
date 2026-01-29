import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/sidebar";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // 1. Get the current authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  let role = "user"; // Default to basic user instead of 'other'
  let userName = "";

  if (user) {
    // 2. Fetch the profile. 
    // IMPORTANT: Ensure the 'profiles' table has 'id' matching 'user.id'
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();
    
    // Log the error if the profile isn't found so you can see it in your terminal
    if (error) {
      console.error("Layout Role Fetch Error:", error.message);
    }

    if (profile) {
      role = profile.role;
      userName = profile.full_name || user.email?.split('@')[0] || "Admin"; 
    }

    console.log("SIDEBAR_DEBUG: Current Role:", role);
  }

  return (
    <html 
      lang="en" 
      className={`${GeistSans.variable} ${GeistMono.variable} h-full bg-[#0a0c10]`}
    >
      <body className="h-full bg-[#0a0c10] text-zinc-100 antialiased font-sans m-0 p-0 overflow-hidden">
        <div className="flex h-full w-full">
          {/* 3. Pass the actual role string to the Sidebar */}
          {user && <Sidebar role={role} userName={userName} />}

          <main className="flex-1 overflow-y-auto bg-black border-l border-zinc-800/30">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}