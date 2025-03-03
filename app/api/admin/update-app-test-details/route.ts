import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Disable body parser to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse the multipart form data
    const formData = await request.formData();
    const appId = formData.get("appId") as string;
    const review = formData.get("review") as string;
    const files = formData.getAll("screenshots") as File[];

    if (!appId) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    // Get app details to use the app name in the file path
    const { data: appData, error: appError } = await supabase
      .from("apps")
      .select("name")
      .eq("id", appId)
      .single();

    if (appError) {
      console.error("Error fetching app details:", appError);
      return NextResponse.json(
        { error: "Failed to fetch app details" },
        { status: 500 }
      );
    }

    // Create a safe app name for file naming (remove special chars, replace spaces with underscores)
    const safeAppName = appData.name
      .replace(/[^a-zA-Z0-9_\s]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    // Upload screenshots to Supabase storage
    const screenshotUrls: string[] = [];

    for (const file of files) {
      try {
        // Generate a unique filename with app name prefix
        const fileExt = file.name.split(".").pop();
        const fileName = `${safeAppName}_${uuidv4()}.${fileExt}`;
        const filePath = `${appId}/${fileName}`;

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from("app_screenshots")
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Error uploading file:", error);
          continue; // Skip this file but continue with others
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("app_screenshots")
          .getPublicUrl(filePath);

        screenshotUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }

    // Update the app with test details
    const { error } = await supabase
      .from("apps")
      .update({
        app_review: review,
        app_screenshots: screenshotUrls,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appId);

    if (error) {
      console.error("Error updating app:", error);
      return NextResponse.json(
        { error: "Failed to update app" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      screenshots: screenshotUrls,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
