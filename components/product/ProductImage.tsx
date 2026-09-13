import Image from "next/image";
import { PRODUCT_TYPE_LABELS, type ProductType } from "@/lib/catalog";
import { GAME_STYLES } from "@/lib/game-styles";
import type { GameName } from "@/lib/games";
import { cn } from "@/lib/utils";

/** Product photo, or a game-colored placeholder until images are uploaded. */
export function ProductImage({
  src,
  alt,
  gameName,
  productType,
  className,
}: {
  src?: string;
  alt: string;
  gameName?: GameName;
  productType?: ProductType;
  className?: string;
}) {
  const style = gameName ? GAME_STYLES[gameName] : undefined;

  return (
    <div className={cn("relative aspect-square overflow-hidden rounded-lg bg-muted", className)}>
      {src ? (
        // Image hosting isn't decided yet (S3/Cloudinary), so skip Next's optimizer for arbitrary hosts.
        <Image src={src} alt={alt} fill unoptimized className="object-contain p-2" />
      ) : (
        <div aria-hidden className="flex size-full flex-col items-center justify-center gap-2">
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-xl text-sm font-bold text-white",
              style?.className ?? "bg-muted-foreground",
            )}
          >
            {style?.monogram ?? "TCG"}
          </span>
          {productType && <span className="text-xs text-muted-foreground">{PRODUCT_TYPE_LABELS[productType]}</span>}
        </div>
      )}
    </div>
  );
}
