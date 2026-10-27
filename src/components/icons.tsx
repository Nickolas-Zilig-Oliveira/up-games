import { Cable, Disc3, Gamepad2, Headphones, Monitor, Package, Sparkles, type LucideIcon } from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  disc: Disc3,
  monitor: Monitor,
  gamepad: Gamepad2,
  headphones: Headphones,
  cable: Cable,
  sparkles: Sparkles,
  package: Package,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = categoryIcons[name] ?? Package;
  return <Icon className={className} />;
}

type SvgProps = { className?: string };

export function InstagramIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 3c.4 2.2 1.8 3.7 4 3.9v3.2c-1.5 0-2.9-.4-4-1.2v6.3c0 3.4-2.7 5.8-5.9 5.8S5 18.6 5 15.4c0-3.4 2.9-6 6.4-5.6v3.3c-1.4-.4-3 .6-3 2.3 0 1.4 1.1 2.5 2.4 2.5 1.5 0 2.5-1 2.5-2.9V3h3.3z" />
    </svg>
  );
}

export function WhatsIcon({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.3.3-1 .9-1 2.3s1 2.7 1.1 2.8c.1.2 2 3 4.8 4.2 1.8.8 2.5.8 3.4.7.6-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3z" />
    </svg>
  );
}

/** A estrela de quatro pontas da logo, redesenhada como vetor. */
export function UpStar({ className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 2 L60 40 L98 50 L60 60 L50 98 L40 60 L2 50 L40 40 Z"
        fill="currentColor"
      />
    </svg>
  );
}
