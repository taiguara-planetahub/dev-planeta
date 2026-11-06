import MovimentacoesTable from "@/components/MovimentacoesTable";
import { PageHeader, btnSecCls, inputCls } from "@/components/ui";
import { listarMovimentacoes, listarProdutos } from "@/lib/estoque";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({ searchParams }: PageProps<"/movimentacoes">) {
  const sp = await searchParams;
  const tipo = sp.tipo === "ENTRADA" || sp.tipo === "SAIDA" ? sp.tipo : undefined;
  const produto_id = Number(sp.produto) || undefined;

  const [movs, produtos] = await Promise.all([
    listarMovimentacoes({ tipo, produto_id, limite: 500 }),
    listarProdutos(),
  ]);

  return (
    <div>
      <PageHeader
        title="Histórico"
        description="Todas as entradas e saídas registradas"
        action={{ href: "/produtos", label: "+ Nova movimentação" }}
      />

      <form className="mb-4 flex flex-wrap gap-2">
        <select name="tipo" defaultValue={tipo ?? ""} className={`${inputCls} w-auto`}>
          <option value="">Todos os tipos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SAIDA">Saídas</option>
        </select>
        <select name="produto" defaultValue={produto_id ?? ""} className={`${inputCls} w-auto`}>
          <option value="">Todos os produtos</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.nome}
            </option>
          ))}
        </select>
        <button className={btnSecCls}>Filtrar</button>
      </form>

      <MovimentacoesTable movs={movs} />
      {movs.length === 500 && (
        <p className="mt-2 text-xs text-slate-500">Mostrando as 500 mais recentes. Use os filtros para refinar.</p>
      )}
    </div>
  );
}
