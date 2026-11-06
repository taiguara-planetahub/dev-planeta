import Link from "next/link";
import MovimentacoesTable from "@/components/MovimentacoesTable";
import ProdutoForm from "@/components/ProdutoForm";
import {
  PageHeader,
  SaldoBadge,
  SectionTitle,
  cardCls,
  linkCls,
  tableCls,
  tableWrapCls,
  tbodyCls,
  tdCls,
  thCls,
  theadCls,
  trCls,
} from "@/components/ui";
import { listarMovimentacoes, produtosAbaixoDoMinimo, resumo } from "@/lib/estoque";
import { fmtQtd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Painel() {
  const [r, baixos, ultimas] = await Promise.all([
    resumo(),
    produtosAbaixoDoMinimo(),
    listarMovimentacoes({ limite: 8 }),
  ]);

  const cards = [
    { label: "Produtos cadastrados", valor: r.total_produtos, cor: "bg-blue-500" },
    { label: "Abaixo do mínimo", valor: r.abaixo_minimo, cor: "bg-amber-500" },
    { label: "Entradas hoje", valor: r.entradas_hoje, cor: "bg-emerald-500" },
    { label: "Saídas hoje", valor: r.saidas_hoje, cor: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Painel" description="Visão geral do estoque e cadastro de produtos" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`${cardCls} relative overflow-hidden p-5`}>
            <span className={`absolute inset-y-0 left-0 w-1 ${c.cor}`} />
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className={`${cardCls} p-5 lg:col-span-2`}>
          <SectionTitle>Cadastrar produto</SectionTitle>
          <p className="mb-4 text-sm text-slate-500">
            O produto começa com saldo zero. Lance o estoque pela aba Estoque.
          </p>
          <ProdutoForm />
        </section>

        <section className="lg:col-span-3">
          <SectionTitle>Estoque baixo</SectionTitle>
          {baixos.length === 0 ? (
            <div className={`${cardCls} p-6 text-sm text-slate-500`}>Nenhum produto abaixo do mínimo.</div>
          ) : (
            <div className={tableWrapCls}>
              <table className={tableCls}>
                <thead className={theadCls}>
                  <tr>
                    <th className={thCls}>Produto</th>
                    <th className={`${thCls} text-right`}>Saldo</th>
                    <th className={`${thCls} text-right`}>Mínimo</th>
                    <th className={thCls}>Status</th>
                    <th className={thCls}></th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  {baixos.map((p) => (
                    <tr key={p.id} className={trCls}>
                      <td className={tdCls}>
                        <Link href={`/produtos/${p.id}`} className={linkCls}>
                          {p.nome}
                        </Link>
                        <span className="block font-mono text-xs text-slate-400">{p.sku}</span>
                      </td>
                      <td className={`${tdCls} whitespace-nowrap text-right`}>
                        {fmtQtd(p.saldo)} {p.unidade}
                      </td>
                      <td className={`${tdCls} text-right text-slate-500`}>{fmtQtd(p.estoque_minimo)}</td>
                      <td className={tdCls}>
                        <SaldoBadge saldo={p.saldo} minimo={p.estoque_minimo} />
                      </td>
                      <td className={`${tdCls} text-right`}>
                        <Link
                          href={`/produtos?tipo=ENTRADA&produto=${p.id}`}
                          className="font-medium text-emerald-600 hover:underline"
                        >
                          + Entrada
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section>
        <SectionTitle
          extra={
            <Link href="/movimentacoes" className={`${linkCls} text-sm`}>
              Ver todas →
            </Link>
          }
        >
          Últimas movimentações
        </SectionTitle>
        <MovimentacoesTable movs={ultimas} />
      </section>
    </div>
  );
}
