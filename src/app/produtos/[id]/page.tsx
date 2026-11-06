import Link from "next/link";
import { notFound } from "next/navigation";
import ExcluirProdutoButton from "@/components/ExcluirProdutoButton";
import MovimentacoesTable from "@/components/MovimentacoesTable";
import { SaldoBadge, SectionTitle, btnEntradaCls, btnSaidaCls, btnSecCls, cardCls } from "@/components/ui";
import { buscarProduto, listarMovimentacoes } from "@/lib/estoque";
import { fmtQtd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProdutoPage({ params }: PageProps<"/produtos/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const produto = await buscarProduto(id);
  if (!produto) notFound();
  const movs = await listarMovimentacoes({ produto_id: id });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/produtos" className="text-sm text-slate-500 hover:text-slate-800">
          ← Voltar para Estoque
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-slate-400">{produto.sku}</p>
            <h1 className="text-2xl font-semibold text-slate-900">{produto.nome}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/produtos?tipo=ENTRADA&produto=${id}`} className={btnEntradaCls}>
              + Entrada
            </Link>
            <Link href={`/produtos?tipo=SAIDA&produto=${id}`} className={btnSaidaCls}>
              − Saída
            </Link>
            <Link href={`/produtos/${id}/editar`} className={btnSecCls}>
              Editar
            </Link>
            <ExcluirProdutoButton id={id} nome={produto.nome} totalMovs={produto.total_movs} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className={`${cardCls} p-5`}>
          <p className="text-sm text-slate-500">Saldo atual</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {fmtQtd(produto.saldo)} <span className="text-base font-normal text-slate-500">{produto.unidade}</span>
          </p>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="text-sm text-slate-500">Estoque mínimo</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{fmtQtd(produto.estoque_minimo)}</p>
        </div>
        <div className={`${cardCls} p-5`}>
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-3">
            <SaldoBadge saldo={produto.saldo} minimo={produto.estoque_minimo} />
          </p>
        </div>
      </div>

      <section>
        <SectionTitle>Histórico do produto</SectionTitle>
        <MovimentacoesTable movs={movs} mostrarProduto={false} />
      </section>
    </div>
  );
}
