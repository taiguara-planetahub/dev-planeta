import Link from "next/link";
import type { Movimentacao } from "@/lib/estoque";
import DesfazerButton from "./DesfazerButton";
import { fmtData, fmtQtd } from "@/lib/format";
import { TipoBadge, cardCls, linkCls, tableCls, tableWrapCls, tbodyCls, tdCls, thCls, theadCls, trCls } from "./ui";

export default function MovimentacoesTable({
  movs,
  mostrarProduto = true,
}: {
  movs: Movimentacao[];
  mostrarProduto?: boolean;
}) {
  if (movs.length === 0) {
    return <div className={`${cardCls} p-6 text-sm text-slate-500`}>Nenhuma movimentação encontrada.</div>;
  }

  return (
    <div className={tableWrapCls}>
      <table className={tableCls}>
        <thead className={theadCls}>
          <tr>
            <th className={thCls}>Data</th>
            <th className={thCls}>Tipo</th>
            {mostrarProduto && <th className={thCls}>Produto</th>}
            <th className={`${thCls} text-right`}>Qtd</th>
            <th className={`${thCls} text-right`}>Saldo após</th>
            <th className={thCls}>Documento</th>
            <th className={thCls}>Observação</th>
            <th className={thCls}></th>
          </tr>
        </thead>
        <tbody className={tbodyCls}>
          {movs.map((m) => (
            <tr key={m.id} className={trCls}>
              <td className={`${tdCls} whitespace-nowrap text-slate-500`}>{fmtData(m.criado_em)}</td>
              <td className={tdCls}>
                <TipoBadge tipo={m.tipo} />
              </td>
              {mostrarProduto && (
                <td className={tdCls}>
                  <Link href={`/produtos/${m.produto_id}`} className={linkCls}>
                    {m.nome}
                  </Link>
                  <span className="block font-mono text-xs text-slate-400">{m.sku}</span>
                </td>
              )}
              <td
                className={`${tdCls} whitespace-nowrap text-right font-semibold ${
                  m.tipo === "ENTRADA" ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {m.tipo === "ENTRADA" ? "+" : "−"}
                {fmtQtd(m.quantidade)} {m.unidade}
              </td>
              <td className={`${tdCls} whitespace-nowrap text-right`}>{fmtQtd(m.saldo_apos)}</td>
              <td className={`${tdCls} text-slate-600`}>{m.documento ?? "—"}</td>
              <td className={`${tdCls} text-slate-500`}>{m.observacao ?? "—"}</td>
              <td className={`${tdCls} whitespace-nowrap text-right`}>
                {m.estornada ? (
                  <span className="text-xs text-slate-400">Desfeito</span>
                ) : m.estorno_de ? null : (
                  <DesfazerButton id={m.id} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
