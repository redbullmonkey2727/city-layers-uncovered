import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface CityPhotoData {
  id: string;
  url: string;
  thumbUrl: string;
  blurHash: string | null;
  alt: string;
  width: number;
  height: number;
  credit: { name: string; link: string };
}

interface CityImageProps {
  photo?: CityPhotoData | null;
  cityName: string;
  alt?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
  size?: "thumb" | "full";
  showCredit?: boolean;
  onClick?: () => void;
}

/**
 * CityImage — hybrid image component with:
 * - Instant gradient placeholder with city name
 * - Low-res thumbnail that loads first
 * - Full-res image swap
 * - Graceful fallback on error
 * - Lazy loading
 * - Explicit dimensions to prevent CLS
 */
const CityImage = ({
  photo,
  cityName,
  alt,
  className,
  aspectRatio = "video",
  size = "full",
  showCredit = false,
  onClick,
}: CityImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
  };

  // If the image is already cached by the browser, mark loaded immediately
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [photo]);

  const showFallback = !photo || errored;
  const imgSrc = photo ? (size === "thumb" ? photo.thumbUrl : photo.url) : "";

  // Generate a deterministic gradient from city name
  const hue = cityName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClasses[aspectRatio],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {/* Gradient placeholder — always rendered, visible until image loads */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 40%, 20%) 0%, hsl(${(hue + 40) % 360}, 50%, 15%) 100%)`,
        }}
      >
        {showFallback && (
          <span className="text-white/50 font-heading text-sm uppercase tracking-widest select-none">
            {cityName}
          </span>
        )}
      </div>

      {/* Actual image */}
      {!showFallback && (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt || photo?.alt || `${cityName} photograph`}
          width={photo?.width || 1200}
          height={photo?.height || 800}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Unsplash credit (required by their API terms) */}
      {showCredit && photo && !errored && loaded && (
        <div className="absolute bottom-1 right-1 z-10">
          <a
            href={photo.credit.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-white/60 hover:text-white/90 transition-colors bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded"
            onClick={(e) => e.stopPropagation()}
          >
            📷 {photo.credit.name}
          </a>
        </div>
      )}
    </div>
  );
};

export default CityImage;
