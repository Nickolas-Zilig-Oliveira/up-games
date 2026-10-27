import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/types";
import { UpStar } from "../icons";

type Props = Pick<Banner, "title" | "subtitle" | "buttonLabel" | "link" | "image">;

/** Um banner da página inicial. O texto é sempre claro, porque fica sobre a foto ou o degradê. */
export function BannerSlide({ title, subtitle, buttonLabel, link, image, asLink = true }: Props & { asLink?: boolean }) {
  const external = /^https?:\/\//.test(link);
  const button = (
    <span className="btn btn-ember mt-5 h-12 px-6 text-base sm:mt-7">
      {buttonLabel || "Ver agora"} <ArrowRight className="size-4" />
    </span>
  );
  return (
    <div className="chamfer relative isolate flex h-full min-h-[260px] items-end overflow-hidden bg-[#2a1d5e] sm:min-h-[340px] sm:items-center lg:min-h-[400px]" style={{ "--cut": "28px" } as React.CSSProperties}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" draggable={false} />
      ) : (
        <>
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#e24f00] via-[#8e2ad4] to-[#2a1d5e]" />
          <UpStar className="absolute -right-10 -top-16 -z-10 size-[420px] text-white/10" />
        </>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/30 to-transparent sm:bg-gradient-to-r sm:from-black/75 sm:via-black/35 sm:to-transparent" />
      <div className="max-w-[640px] p-6 text-white sm:p-12 lg:p-16">
        <h2 className="display text-[clamp(2.6rem,6.5vw,5.5rem)] drop-shadow-lg">{title}</h2>
        {subtitle && <p className="mt-3 max-w-[46ch] text-base text-white/90 sm:text-lg">{subtitle}</p>}
        {asLink ? (
          <Link href={link} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="inline-block">
            {button}
          </Link>
        ) : (
          button
        )}
      </div>
    </div>
  );
}
