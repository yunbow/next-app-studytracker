"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

/**
 * Next.js Imageを使用する最適化されたAvatarImage
 * - 自動画像最適化（WebP変換、リサイズ）
 * - 遅延読み込み
 * - Radix UIのフォールバック機能と連携
 */
type OptimizedAvatarImageProps = {
  src?: string | null
  alt?: string
  className?: string
}

function OptimizedAvatarImage({ src, alt = "", className }: OptimizedAvatarImageProps) {
  const [hasError, setHasError] = React.useState(false)

  // srcが変更されたらエラー状態をリセット
  React.useEffect(() => {
    setHasError(false)
  }, [src])

  // srcがない、またはエラーの場合はnullを返す（フォールバックが表示される）
  if (!src || hasError) {
    return null
  }

  return (
    <Image
      data-slot="avatar-image"
      src={src}
      alt={alt}
      fill
      sizes="64px"
      className={cn("aspect-square object-cover", className)}
      onError={() => setHasError(true)}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, OptimizedAvatarImage }
