import { CategoryIcon } from "./icons";

/** Imagem do produto, ou uma arte gerada com a raridade quando ainda não há foto. */
export function ProductArt({
  image,
  name,
  platform,
  rarity,
  icon,
  className = "",
  size = "md",
}: {
  image?: string;
  name: string;
  platform: string;
  rarity: string;
  icon: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (image) {
    // A foto aparece inteira (sem cortar), centralizada num fundo neutro de vitrine.
    const pad = size === "sm" ? "p-1" : size === "lg" ? "p-[5%]" : "p-[7%]";
    return (
      <div className={`h-full w-full bg-photo ${pad} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="h-full w-full object-contain" loading="lazy" draggable={false} />
      </div>
    );
  }
  const iconSize = size === "lg" ? "size-28" : size === "sm" ? "size-6" : "size-14";
  return (
    <div
      data-rarity={rarity}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-deep ${className}`}
      role="img"
      aria-label={name}
    >
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 55% at 50% 45%, color-mix(in srgb, var(--r) 30%, transparent), transparent 70%)" }}
      />
      {size !== "sm" && (
        <span
          className="display pointer-events-none absolute -bottom-[0.12em] left-0 right-0 truncate text-center text-transparent select-none"
          style={{
            fontSize: size === "lg" ? "clamp(4.5rem, 16vw, 8rem)" : "3rem",
            WebkitTextStroke: "1px color-mix(in srgb, var(--r) 45%, transparent)",
          }}
          aria-hidden
        >
          {platform}
        </span>
      )}
      <CategoryIcon name={icon} className={`relative ${iconSize} rarity-text drop-shadow-[0_0_18px_var(--r)]`} />
    </div>
  );
}
