"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils/image-url";

type Props = {
  onUpload: (files: File[]) => Promise<string[]>;
  maxImages?: number;
  existingImages?: string[];
  onRemove?: (url: string) => void;
};

export function ImageUploader({ 
  onUpload, 
  maxImages = 5, 
  existingImages = [],
  onRemove 
}: Props) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      alert(`最大${maxImages}枚まで画像をアップロードできます`);
      return;
    }

    setIsUploading(true);
    try {
      const urls = await onUpload(files);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    onRemove?.(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((url, index) => {
          const imageUrl = getImageUrl(url) || url;
          return (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
              <Image
                src={imageUrl}
                alt={`アップロード画像 ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                aria-label={`画像 ${index + 1} を削除`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {images.length < maxImages && (
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            aria-label="画像をアップロード"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="w-full"
              asChild
            >
              <span className="flex items-center justify-center gap-2 cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    画像をアップロード ({images.length}/{maxImages})
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
}
