"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { salvarProduto, type FormState } from "@/app/actions";
import { Alert, Field, btnCls, btnSecCls, inputCls } from "./ui";

type Props = {
  produto?: { id: number; sku: string; nome: string; unidade: string; estoque_minimo: number };
};

export default function ProdutoForm({ produto }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    salvarProduto.bind(null, produto?.id ?? null),
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Código / SKU *" error={state.errors?.sku}>
          <input name="sku" defaultValue={produto?.sku} required maxLength={50} className={inputCls} />
        </Field>
        <Field label="Unidade *" error={state.errors?.unidade}>
          <input
            name="unidade"
            defaultValue={produto?.unidade ?? "UN"}
            required
            maxLength={10}
            className={inputCls}
            placeholder="UN, KG, CX, L..."
          />
        </Field>
      </div>
      <Field label="Nome *" error={state.errors?.nome}>
        <input name="nome" defaultValue={produto?.nome} required maxLength={200} className={inputCls} />
      </Field>
      <Field label="Estoque mínimo (alerta)" error={state.errors?.estoque_minimo}>
        <input
          name="estoque_minimo"
          type="number"
          step="any"
          min="0"
          defaultValue={produto?.estoque_minimo ?? 0}
          className={inputCls}
        />
      </Field>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Salvando..." : produto ? "Salvar" : "Cadastrar produto"}
        </button>
        {produto && (
          <Link href={`/produtos/${produto.id}`} className={btnSecCls}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
