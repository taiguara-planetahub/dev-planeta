"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { registrarMovimentacao, type FormState } from "@/app/actions";
import { Alert, Field, btnEntradaCls, btnSaidaCls, inputCls } from "./ui";

type ProdutoOpt = { id: number; sku: string; nome: string; unidade: string; saldo: number };

export default function MovimentacaoForm({
  produtos,
  tipoInicial = "ENTRADA",
  produtoInicial,
}: {
  produtos: ProdutoOpt[];
  tipoInicial?: "ENTRADA" | "SAIDA";
  produtoInicial?: number;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(registrarMovimentacao, {});
  const [tipo, setTipo] = useState(tipoInicial);
  const [produtoId, setProdutoId] = useState(produtoInicial ? String(produtoInicial) : "");
  const formRef = useRef<HTMLFormElement>(null);
  const selecionado = produtos.find((p) => String(p.id) === produtoId);

  useEffect(() => {
    if (!state.ok || !formRef.current) return;
    for (const nome of ["quantidade", "documento", "observacao"]) {
      const el = formRef.current.elements.namedItem(nome) as HTMLInputElement | null;
      if (el) el.value = "";
    }
  }, [state]);

  if (produtos.length === 0) {
    return <p className="text-sm text-slate-500">Cadastre um produto no Painel antes de registrar movimentações.</p>;
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-4"
    >
      {state.message && <Alert ok={state.ok}>{state.message}</Alert>}

      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {(["ENTRADA", "SAIDA"] as const).map((t) => (
          <label
            key={t}
            className={`flex-1 cursor-pointer rounded-md px-4 py-2 text-center text-sm font-semibold transition-colors ${
              tipo === t
                ? t === "ENTRADA"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <input
              type="radio"
              name="tipo"
              value={t}
              checked={tipo === t}
              onChange={() => setTipo(t)}
              className="sr-only"
            />
            {t === "ENTRADA" ? "Entrada" : "Saída"}
          </label>
        ))}
      </div>

      <Field label="Produto *" error={state.errors?.produto_id}>
        <select
          name="produto_id"
          required
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          className={inputCls}
        >
          <option value="">Selecione...</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.nome}
            </option>
          ))}
        </select>
        {selecionado && (
          <span className="block text-xs text-slate-500">
            Saldo atual:{" "}
            <strong className="text-slate-800">
              {selecionado.saldo.toLocaleString("pt-BR")} {selecionado.unidade}
            </strong>
          </span>
        )}
      </Field>

      <Field label="Quantidade *" error={state.errors?.quantidade}>
        <input
          name="quantidade"
          type="number"
          step="any"
          min="0"
          required
          max={tipo === "SAIDA" && selecionado ? selecionado.saldo : undefined}
          className={inputCls}
        />
      </Field>

      <Field label="Documento (NF, pedido...)" error={state.errors?.documento}>
        <input name="documento" maxLength={100} className={inputCls} />
      </Field>

      <Field label="Observação" error={state.errors?.observacao}>
        <textarea name="observacao" rows={2} maxLength={1000} className={inputCls} />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className={`${tipo === "SAIDA" ? btnSaidaCls : btnEntradaCls} w-full`}
      >
        {pending ? "Registrando..." : tipo === "ENTRADA" ? "Registrar entrada" : "Registrar saída"}
      </button>
    </form>
  );
}
