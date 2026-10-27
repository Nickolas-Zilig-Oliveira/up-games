import { UpStar } from "../icons";

export function AuthShell({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[1100px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
      <div className="relative hidden lg:block">
        <UpStar className="spin-slow absolute -left-10 -top-16 size-72 text-plate/60" />
        <h1 className="display relative text-[6.5rem]">{title}</h1>
        <p className="relative mt-5 max-w-[38ch] text-lg text-fog">{text}</p>
      </div>
      <div className="chamfer edge mx-auto w-full max-w-md" style={{ "--cut": "22px" } as React.CSSProperties}>
        <div className="chamfer bg-deep p-7 sm:p-9" style={{ "--cut": "22px" } as React.CSSProperties}>
          <h1 className="display mb-6 text-5xl lg:hidden">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}
