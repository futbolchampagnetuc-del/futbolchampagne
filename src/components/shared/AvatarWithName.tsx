import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarWithNameProps {
  name: string;
  fotoUrl?: string | null;
  dorsal?: number | null;
  showDorsal?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarWithName({
  name,
  fotoUrl,
  dorsal,
  showDorsal = false,
  size = "md",
  className,
}: AvatarWithNameProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  const gradientBg = "bg-gradient-to-br from-[#d4af37]/20 to-[#b8860b]/10";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={name}
            className={cn(
              "rounded-full object-cover ring-2 ring-[#d4af37]/20",
              sizeClasses[size]
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full font-semibold text-[#a67c2e]",
              gradientBg,
              "ring-1 ring-[#d4af37]/20",
              sizeClasses[size]
            )}
          >
            {getInitials(name)}
          </div>
        )}
        {showDorsal && dorsal && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] px-1.5 text-[10px] font-bold text-white shadow-sm">
            {dorsal}
          </span>
        )}
      </div>
      <span className="font-medium text-[#1a1a2e]">{name}</span>
    </div>
  );
}
