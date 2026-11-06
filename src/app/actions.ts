"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import * as estoque from "@/lib/estoque";

export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const numero = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().replace(",", ".") : v),
  z.coerce.number({ error: "Informe um número válido" }),
);

const produtoSchema = z.object({
  sku: z.string().trim().min(1, "Informe o código/SKU").max(50).transform((s) => s.toUpperCase()),
  nome: z.string().trim().min(1, "Informe o nome").max(200),
  unidade: z.string().trim().min(1, "Informe a unidade").max(10).transform((s) => s.toUpperCase()),
  estoque_minimo: numero.pipe(z.number().min(0, "Não pode ser negativo")),
});

const movSchema = z.object({
  produto_id: z.coerce.number({ error: "Selecione um produto" }).int().positive("Selecione um produto"),
  tipo: z.enum(["ENTRADA", "SAIDA"], { error: "Tipo inválido" }),
  quantidade: numero.pipe(z.number().positive("A quantidade deve ser maior que zero")),
  documento: z.string().trim().max(100).optional(),
  observacao: z.string().trim().max(1000).optional(),
});

function erroParaState(e: unknown): FormState {
  if (e instanceof estoque.EstoqueError) return { ok: false, message: e.message };
  console.error(e);
  return { ok: false, message: "Erro inesperado ao salvar. Tente novamente." };
}

export async function salvarProduto(
  id: number | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = produtoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    if (id) await estoque.atualizarProduto(id, parsed.data);
    else await estoque.criarProduto(parsed.data);
  } catch (e) {
    return erroParaState(e);
  }

  revalidatePath("/", "layout");
  if (id) redirect(`/produtos/${id}`);
  return { ok: true, message: `Produto ${parsed.data.sku} cadastrado.` };
}

export async function excluirProduto(id: number): Promise<FormState> {
  try {
    await estoque.excluirProduto(id);
  } catch (e) {
    return erroParaState(e);
  }
  revalidatePath("/", "layout");
  redirect("/produtos");
}

export async function registrarMovimentacao(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = movSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    const { saldo } = await estoque.registrarMovimentacao(parsed.data);
    revalidatePath("/", "layout");
    const acao = parsed.data.tipo === "ENTRADA" ? "Entrada" : "Saída";
    return {
      ok: true,
      message: `${acao} registrada. Novo saldo: ${saldo.toLocaleString("pt-BR")}.`,
    };
  } catch (e) {
    return erroParaState(e);
  }
}

export async function desfazerMovimentacao(id: number): Promise<FormState> {
  try {
    await estoque.estornarMovimentacao(id);
  } catch (e) {
    return erroParaState(e);
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
