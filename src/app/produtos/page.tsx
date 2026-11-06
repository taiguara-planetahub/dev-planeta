import Link from "next/link";
import ExcluirProdutoButton from "@/components/ExcluirProdutoButton";
import MovimentacaoForm from "@/components/MovimentacaoForm";
import {
  PageHeader,
  SaldoBadge,
  SectionTitle,
  btnSecCls,
  cardCls,
  inputCls,
  linkCls,
  tableCls,
  tableWrapCls,
  tbodyCls,
  tdCls,
  thCls,
  theadCls,
  trCls,
} from "@/components/ui";
import { listarProdutos } from "@/lib/estoque";
import { fmtQtd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EstoquePage({ searchParams }: PageProps<"/produtos">) {
  const sp = await searchParams;
  const busca = typeof sp.q === "string" ? sp.q : "";
  const tipo = sp.tipo === "SAIDA" ? "SAIDA" : "ENTRADA";
  const produtoSel = Number(sp.produto) || undefined;

  const [todos, filtrados] = await Promise.all([listarProdutos(), busca ? listarProdutos(busca) : null]);
  const lista = filtrados ?? todos;

  const linkMov = (t: "ENTRADA" | "SAIDA", id: number) => {
    const p = new URLSearchParams({ tipo: t, produto: String(id) });
    if (busca) p.set("q", busca);
    return `/produtos?${p}`;
  };

  return (
    <div>
      <PageHeader title="Estoque" description="Produtos, entradas e saídas em um só lugar" />

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${cardCls} p-5 xl:self-start`}>
          <SectionTitle>Entrada / Saída</SectionTitle>
          <MovimentacaoForm
            key={`${tipo}-${produtoSel ?? ""}`}
            produtos={todos}
            tipoInicial={tipo}
            produtoInicial={produtoSel}
          />
        </section>

        <section className="space-y-3 xl:col-span-2">
          <form className="flex gap-2">
            <input name="q" defaultValue={busca} placeholder="Buscar por SKU ou nome..." className={inputCls} />
            <button className={btnSecCls}>Buscar</button>
            {busca && (
              <Link href="/produtos" className={btnSecCls}>
                Limpar
              </Link>
            )}
          </form>

          {lista.length === 0 ? (
            <div className={`${cardCls} p-6 text-sm text-slate-500`}>
              {busca ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda. Cadastre pelo Painel."}
            </div>
          ) : (
            <div className={tableWrapCls}>
              <table className={tableCls}>
                <thead className={theadCls}>
                  <tr>
                    <th className={thCls}>Produto</th>
                    <th className={`${thCls} text-right`}>Saldo</th>
                    <th className={`${thCls} text-right`}>Mínimo</th>
                    <th className={thCls}>Status</th>
                    <th className={`${thCls} text-right`}>Ações</th>
                  </tr>
                </thead>
                <tbody className={tbodyCls}>
                  {lista.map((p) => (
                    <tr key={p.id} className={p.id === produtoSel ? "bg-blue-50" : trCls}>
                      <td className={tdCls}>
                        <Link href={`/produtos/${p.id}`} className={linkCls}>
                          {p.nome}
                        </Link>
                        <span className="block font-mono text-xs text-slate-400">{p.sku}</span>
                      </td>
                      <td className={`${tdCls} whitespace-nowrap text-right font-semibold text-slate-900`}>
                        {fmtQtd(p.saldo)} <span className="font-normal text-slate-500">{p.unidade}</span>
                      </td>
                      <td className={`${tdCls} text-right text-slate-500`}>{fmtQtd(p.estoque_minimo)}</td>
                      <td className={tdCls}>
                        <SaldoBadge saldo={p.saldo} minimo={p.estoque_minimo} />
                      </td>
                      <td className={`${tdCls} whitespace-nowrap text-right`}>
                        <div className="inline-flex items-center gap-4">
                          <Link href={linkMov("ENTRADA", p.id)} className="font-medium text-emerald-600 hover:underline">
                            Entrada
                          </Link>
                          <Link href={linkMov("SAIDA", p.id)} className="font-medium text-rose-600 hover:underline">
                            Saída
                          </Link>
                          <ExcluirProdutoButton id={p.id} nome={p.nome} totalMovs={p.total_movs} compacto />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
