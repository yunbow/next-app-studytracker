import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const IMAGE_SIGNATURES: { type: string; ext: string; signatures: number[][] }[] = [
  { type: "image/jpeg", ext: "jpg", signatures: [[0xFF, 0xD8, 0xFF]] },
  { type: "image/png", ext: "png", signatures: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]] },
  { type: "image/gif", ext: "gif", signatures: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]] },
  { type: "image/webp", ext: "webp", signatures: [[0x52, 0x49, 0x46, 0x46]] },
];

function validateImageMagicNumber(buffer: Buffer): { type: string; ext: string } | null {
  for (const { type, ext, signatures } of IMAGE_SIGNATURES) {
    for (const signature of signatures) {
      if (buffer.length < signature.length) continue;
      const matches = signature.every((byte, index) => buffer[index] === byte);
      if (matches) {
        if (type === "image/webp") {
          if (buffer.length < 12) continue;
          const webpSignature = [0x57, 0x45, 0x42, 0x50];
          const webpMatches = webpSignature.every((byte, index) => buffer[8 + index] === byte);
          if (!webpMatches) continue;
        }
        return { type, ext };
      }
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const validatedImage = validateImageMagicNumber(buffer);
    if (!validatedImage) {
      return NextResponse.json(
        { error: "JPEG、PNG、GIF、WebP形式の画像のみアップロードできます" },
        { status: 400 }
      );
    }

    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    const safeExt = extMap[validatedImage.type] || "jpg";
    const fileName = `${session.user.id}-${crypto.randomBytes(8).toString("hex")}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
