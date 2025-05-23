import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { appId, status } = await request.json();

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Update the app status
    const { error } = await supabase
      .from("apps")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appId);

    if (error) {
      console.error("Error updating app status:", error);
      return NextResponse.json(
        { error: "Failed to update app status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `App status updated to ${status}`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
