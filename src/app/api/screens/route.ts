import { createClient } from "@supabase/supabase-js"; 
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
// /api/screens/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const appVersion = request.headers.get("x-app-version") || "1.0.0";
    const apiKey = request.headers.get("x-api-key");

    // 1. Security Check
    if (!apiKey || apiKey !== process.env.CLIENT_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Build the Query
    let query = supabaseAdmin
      .from("screens")
      .select("id, name, layout, updated_at");

    if (name) {
      // Fetch a specific screen by name
      const { data: screen, error } = await query.eq("name", name).single();

      if (error || !screen) {
        return NextResponse.json({ error: "Screen not found" }, { status: 404 });
      }

      // 3. THE IMPROVEMENT: The "Envelope" Pattern
      // We wrap the layout so the app knows about versions/updates
      return NextResponse.json({
        metadata: {
          screen_id: screen.id,
          name: screen.name,
          last_updated: screen.updated_at,
          version: "v1" // You can drive this from the DB later
        },
        layout: screen.layout // This is what json_dynamic_widget uses
      });
    }

    // 4. Default: Return list for your internal dashboard
    const { data: screens } = await query.order("updated_at", { ascending: false });
    return NextResponse.json({ success: true, data: screens });

  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}