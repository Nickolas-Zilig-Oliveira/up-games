import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-field grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="display text-[clamp(7rem,25vw,16rem)] leading-none text-plate-2">404</p>
        <h1 className="display -mt-6 text-5xl">Game over para esta página</h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-fog">O link pode ter mudado ou o produto saiu da prateleira.</p>
        <Link href="/" className="btn btn-ember mt-8">Voltar para o início</Link>
      </div>
    </div>
  );
}
