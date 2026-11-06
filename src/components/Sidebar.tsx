"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icones = {
  painel: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10",
  estoque: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  historico: "M12 8v4l3 2M3 12a9 9 0 1018 0 9 9 0 00-18 0z",
};

const links = [
  { href: "/", label: "Painel", icone: icones.painel },
  { href: "/produtos", label: "Estoque", icone: icones.estoque },
  { href: "/movimentacoes", label: "Histórico", icone: icones.historico },
];

export default function Sidebar() {
  const pathname = usePathname();
  const ativo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="bg-slate-900 text-slate-300 md:fixed md:inset-y-0 md:left-0 md:w-56">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d={icones.estoque} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-lg font-semibold text-white">Estoque</span>
      </div>
      <nav className="flex gap-1 px-3 pb-3 md:flex-col">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              ativo(l.href) ? "bg-slate-800 text-white" : "hover:bg-slate-800/60 hover:text-white"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d={l.icone} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
