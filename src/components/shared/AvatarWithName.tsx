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

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={name}
            className={cn(
              "rounded-full object-cover",
              sizeClasses[size]
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-green-100 font-semibold text-green-700",
              sizeClasses[size]
            )}
          >
            {getInitials(name)}
          </div>
        )}
        {showDorsal && dorsal && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
            {dorsal}
          </span>
        )}
      </div>
      <span className="font-medium text-gray-800">{name}</span>
    </div>
  );
}
