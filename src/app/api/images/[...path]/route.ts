import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Authentication check
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { path } = await params;
    const imagePath = path.join("/");

    // Security: Prevent path traversal attacks
    if (imagePath.includes("..")) {
      return new NextResponse("Invalid path", { status: 400 });
    }

    // Construct the full file path
    const fullPath = join(process.cwd(), "public", imagePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);

    // Determine content type based on file extension
    const ext = imagePath.split(".").pop()?.toLowerCase();
    const contentType = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    }[ext || ""] || "application/octet-stream";

    // Return the image with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
