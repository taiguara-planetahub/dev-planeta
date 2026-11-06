"use client";

import { useState, useTransition } from "react";
import { excluirProduto } from "@/app/actions";
import { btnDangerCls } from "./ui";

type Props = { id: number; nome: string; totalMovs: number; compacto?: boolean };

export default function ExcluirProdutoButton({ id, nome, totalMovs, compacto }: Props) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string>();

  const confirmar = () => {
    const aviso =
      totalMovs > 0
        ? `\n\nAtenção: ${totalMovs} movimentação(ões) deste produto também serão apagadas do histórico.`
        : "";
    if (!confirm(`Excluir o produto "${nome}"?${aviso}`)) return;
    start(async () => {
      const r = await excluirProduto(id);
      if (r?.message) setErro(r.message);
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={confirmar}
        className={
          compacto
            ? "font-medium text-slate-400 hover:text-rose-600 disabled:opacity-50"
            : btnDangerCls
        }
      >
        {pending ? "Excluindo..." : "Excluir"}
      </button>
      {erro && <span className="block text-xs text-rose-600">{erro}</span>}
    </>
  );
}
