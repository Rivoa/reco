import { createClient } from "@supabase/supabase-js"; 
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const apiKey = request.headers.get("x-api-key");
    const validKey = process.env.CLIENT_API_KEY;

    // 🔍 DEBUG: Look at your VS Code Terminal when you trigger the API
    console.log("================ API DEBUG ================");
    console.log("👉 Key sent by Client:", `"${apiKey}"`);
    console.log("👉 Key on Server (.env):", `"${validKey}"`);
    console.log("===========================================");

    if (!apiKey || apiKey !== validKey) {
      return NextResponse.json(
        { 
          error: "Unauthorized: Invalid or missing API Key",
          debug: { received: apiKey, expected_loaded: !!validKey } // detailed error for now
        }, 
        { status: 401 }
      );
    }

    const { data: screens, error } = await supabaseAdmin
      .from("screens")
      .select("id, name, description, layout, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: screens.length,
      data: screens 
    });

  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}