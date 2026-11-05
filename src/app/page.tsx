import { prisma } from '@/lib/prisma'
import {
  createItem,
  deleteItem,
  createMovimentacao,
  deleteMovimentacao,
} from './actions'
import { TipoMovimentacao } from '@prisma/client'

export const instant = false

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(data)
}

export default async function AlmoxarifadoPage() {
  // Busca simultânea de dados no banco via Prisma
  const [itens, movimentacoes, resumoMovimentacoes] = await Promise.all([
    prisma.item.findMany({
      orderBy: { nome: 'asc' },
    }),
    prisma.movimentacao.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          select: {
            nome: true,
            codigo: true,
            unidade: true,
          },
        },
      },
    }),
    prisma.movimentacao.groupBy({
      by: ['tipo'],
      _sum: {
        quantidade: true,
      },
      _count: {
        id: true,
      },
    }),
  ])

  // Métricas para os cards de resumo
  const totalItens = itens.length
  const totalSaldoGeral = itens.reduce((acc, item) => acc + item.quantidade, 0)
  const itensZerados = itens.filter((item) => item.quantidade === 0).length

  const entradasResumo = resumoMovimentacoes.find(
    (r) => r.tipo === TipoMovimentacao.ENTRADA
  )
  const saidasResumo = resumoMovimentacoes.find(
    (r) => r.tipo === TipoMovimentacao.SAIDA
  )

  const volumeEntradas = entradasResumo?._sum.quantidade ?? 0
  const qtdOperacoesEntrada = entradasResumo?._count.id ?? 0

  const volumeSaidas = saidasResumo?._sum.quantidade ?? 0
  const qtdOperacoesSaida = saidasResumo?._count.id ?? 0

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <header className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm">
                📦
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Controle de Almoxarifado
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Gestão simplificada de itens, saldos e histórico de movimentações
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema Conectado
            </span>
          </div>
        </header>

        {/* Cards de Resumo */}
        <section aria-label="Resumo do Almoxarifado" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total de Itens */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total de Itens
              </span>
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600 text-sm">
                📋
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{totalItens}</span>
              <span className="text-xs text-slate-500">cadastrados</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Volume em estoque: <strong>{totalSaldoGeral}</strong></span>
              {itensZerados > 0 ? (
                <span className="text-amber-600 font-medium">
                  {itensZerados} {itensZerados === 1 ? 'item zerado' : 'itens zerados'}
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">Nenhum zerado</span>
              )}
            </div>
          </div>

          {/* Total de Entradas */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total de Entradas
              </span>
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 text-sm">
                ⬇️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-600">
                +{volumeEntradas}
              </span>
              <span className="text-xs text-slate-500">unidades recebidas</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span>Registradas em <strong>{qtdOperacoesEntrada}</strong> movimentações</span>
            </div>
          </div>

          {/* Total de Saídas */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total de Saídas
              </span>
              <span className="p-2 rounded-lg bg-rose-50 text-rose-600 text-sm">
                ⬆️
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-600">
                -{volumeSaidas}
              </span>
              <span className="text-xs text-slate-500">unidades baixadas</span>
            </div>
            <div className="mt-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <span>Registradas em <strong>{qtdOperacoesSaida}</strong> movimentações</span>
            </div>
          </div>
        </section>

        {/* Formulários de Operação */}
        <section aria-label="Formulários" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário: Novo Item */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                <span className="text-blue-600 font-bold text-base">＋</span>
                <h2 className="text-lg font-bold text-slate-900">
                  Cadastrar Novo Item
                </h2>
              </div>
              <form action={createItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="codigo"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Código (Único) *
                    </label>
                    <input
                      id="codigo"
                      name="codigo"
                      type="text"
                      required
                      placeholder="Ex: EPI-001"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="unidade"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Unidade de Medida *
                    </label>
                    <input
                      id="unidade"
                      name="unidade"
                      type="text"
                      required
                      placeholder="Ex: un, cx, kg, par"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 lowercase transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="nome"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Nome do Item *
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    placeholder="Ex: Luva de Proteção Nitrílica"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantidade"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Saldo Inicial (Opcional)
                  </label>
                  <input
                    id="quantidade"
                    name="quantidade"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Se for maior que zero, criará automaticamente o registro inicial de entrada.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-lg shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Cadastrar Item</span>
                </button>
              </form>
            </div>
          </div>

          {/* Formulário: Movimentação de Estoque */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
                <span className="text-emerald-600 font-bold text-base">⇄</span>
                <h2 className="text-lg font-bold text-slate-900">
                  Registrar Movimentação
                </h2>
              </div>
              <form action={createMovimentacao} className="space-y-4">
                <div>
                  <label
                    htmlFor="itemId"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Item do Almoxarifado *
                  </label>
                  <select
                    id="itemId"
                    name="itemId"
                    required
                    defaultValue=""
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white transition cursor-pointer"
                  >
                    <option value="" disabled>
                      {itens.length === 0
                        ? 'Nenhum item cadastrado'
                        : 'Selecione um item...'}
                    </option>
                    {itens.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.codigo}] {item.nome} — Saldo: {item.quantidade} {item.unidade}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="tipo"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Tipo de Movimentação *
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      required
                      defaultValue={TipoMovimentacao.ENTRADA}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white transition cursor-pointer"
                    >
                      <option value={TipoMovimentacao.ENTRADA}>
                        🟢 Entrada (Recebimento)
                      </option>
                      <option value={TipoMovimentacao.SAIDA}>
                        🔴 Saída (Baixa de Estoque)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="qtdMovimentacao"
                      className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Quantidade *
                    </label>
                    <input
                      id="qtdMovimentacao"
                      name="quantidade"
                      type="number"
                      required
                      min="1"
                      placeholder="Ex: 10"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="observacao"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Observação / Motivo (Opcional)
                  </label>
                  <input
                    id="observacao"
                    name="observacao"
                    type="text"
                    placeholder="Ex: NF 1042 / Requisitado para Manutenção"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={itens.length === 0}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg shadow-xs hover:shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Registrar Movimentação</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Tabela de Itens em Estoque */}
        <section aria-label="Tabela de Itens" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Itens e Saldo em Estoque
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Relação de materiais e respectivos saldos disponíveis
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {itens.length} {itens.length === 1 ? 'item listado' : 'itens listados'}
            </span>
          </div>

          {itens.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm">
                Nenhum item cadastrado no almoxarifado. Utilize o formulário acima para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Código</th>
                    <th scope="col" className="px-6 py-3.5">Nome do Item</th>
                    <th scope="col" className="px-6 py-3.5">Unidade</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Saldo Atual</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itens.map((item) => {
                    const isZerado = item.quantidade === 0

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-slate-50/60 ${
                          isZerado ? 'bg-red-50/40 border-l-4 border-l-red-500' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                          {item.codigo}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {item.nome}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {item.unidade}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isZerado ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                              0 {item.unidade} (ZERADO)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                              {item.quantidade} {item.unidade}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <form action={deleteItem} className="inline-block">
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              title={`Excluir ${item.nome}`}
                              className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                            >
                              Excluir
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tabela de Histórico de Movimentações */}
        <section aria-label="Histórico de Movimentações" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Histórico de Movimentações
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro cronológico completo de entradas, saídas e estornos
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {movimentacoes.length}{' '}
              {movimentacoes.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {movimentacoes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm">
                Nenhuma movimentação registrada até o momento.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Data / Hora</th>
                    <th scope="col" className="px-6 py-3.5">Item</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Tipo</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Quantidade</th>
                    <th scope="col" className="px-6 py-3.5">Observação</th>
                    <th scope="col" className="px-6 py-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movimentacoes.map((mov) => {
                    const isEntrada = mov.tipo === TipoMovimentacao.ENTRADA

                    return (
                      <tr
                        key={mov.id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {formatarData(mov.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {mov.item.nome}
                          </div>
                          <div className="text-xs font-mono text-slate-500">
                            {mov.item.codigo}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {isEntrada ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ⬇ ENTRADA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              ⬆ SAÍDA
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold">
                          <span
                            className={
                              isEntrada ? 'text-emerald-700' : 'text-rose-700'
                            }
                          >
                            {isEntrada ? '+' : '-'}
                            {mov.quantidade} {mov.item.unidade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                          {mov.observacao || (
                            <span className="text-slate-300 italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <form action={deleteMovimentacao} className="inline-block">
                            <input type="hidden" name="id" value={mov.id} />
                            <button
                              type="submit"
                              title="Excluir movimentação e estornar saldo do item"
                              className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
                            >
                              Estornar
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
