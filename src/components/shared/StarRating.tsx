"use client";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={cn(
              "transition-all duration-150",
              readonly ? "cursor-default" : "cursor-pointer active:scale-75"
            )}
            aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          >
            <svg
              className={cn(
                sizeClasses[size],
                "transition-all duration-150",
                filled
                  ? "text-[#d4af37] drop-shadow-sm"
                  : "text-muted-foreground/40 hover:text-[#d4af37]/50"
              )}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
      {!readonly && value > 0 && (
        <span className="ml-1.5 text-sm font-medium text-muted-foreground">{value}/5</span>
      )}
    </div>
  );
}
