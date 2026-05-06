import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_ICON_SRC } from "@/lib/brand";

type BrandMarkProps = {
  label: string;
  showLabel?: boolean;
  markSize?: number;
  className?: string;
  labelClassName?: string;
};

export function BrandMark({
  label,
  showLabel = true,
  markSize = 32,
  className,
  labelClassName,
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={BRAND_ICON_SRC}
        alt={showLabel ? "" : label}
        width={markSize}
        height={markSize}
        sizes={`${markSize}px`}
        priority
        className="shrink-0 rounded-md"
      />
      {showLabel && (
        <span className={cn("font-bold", labelClassName)}>{label}</span>
      )}
    </span>
  );
}
