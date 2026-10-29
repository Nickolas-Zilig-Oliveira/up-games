import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/lib/types";
import { UpStar } from "../icons";

type Props = Pick<Banner, "title" | "subtitle" | "buttonLabel" | "link" | "image">;

/** Um banner da página inicial. O texto é sempre claro, porque fica sobre a foto ou o degradê. */
export function BannerSlide({ title, subtitle, buttonLabel, link, image, asLink = true }: Props & { asLink?: boolean }) {
  const external = /^https?:\/\//.test(link);
  const button = (
    <span className="btn btn-ember mt-5 h-11 px-5 sm:mt-6">
      {buttonLabel || "Ver agora"} <ArrowRight className="size-4" />
    </span>
  );
  return (
    <div
      className="chamfer relative isolate flex h-full min-h-[220px] items-end overflow-hidden bg-[#2a1d5e] sm:min-h-[260px] sm:items-center lg:min-h-[300px]"
      style={{ "--cut": "22px" } as React.CSSProperties}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" draggable={false} />
      ) : (
        <>
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#e24f00] via-[#8e2ad4] to-[#2a1d5e]" />
          <UpStar className="absolute -right-12 -top-20 -z-10 size-[360px] text-white/10" />
        </>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent sm:bg-gradient-to-r sm:from-black/65 sm:via-black/25 sm:to-transparent" />
      <div className="max-w-[600px] p-6 text-white sm:p-10 lg:px-14">
        <h2 className="display t-section text-balance">{title}</h2>
        {subtitle && <p className="mt-3 max-w-[48ch] text-[0.95rem] leading-relaxed text-white/85 sm:text-base">{subtitle}</p>}
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
