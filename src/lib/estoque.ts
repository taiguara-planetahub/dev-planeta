import "server-only";
import { pool } from "./db";

export type TipoMov = "ENTRADA" | "SAIDA";

export type Produto = {
  id: number;
  sku: string;
  nome: string;
  unidade: string;
  estoque_minimo: number;
  saldo: number;
  total_movs: number;
  criado_em: Date;
};

const SELECT_PRODUTO = `SELECT p.*, (SELECT count(*)::int FROM movimentacoes m WHERE m.produto_id = p.id) AS total_movs
  FROM produtos p`;

export type Movimentacao = {
  id: number;
  produto_id: number;
  sku: string;
  nome: string;
  unidade: string;
  tipo: TipoMov;
  quantidade: number;
  saldo_apos: number;
  documento: string | null;
  observacao: string | null;
  estorno_de: number | null;
  estornada: boolean;
  criado_em: Date;
};

export class EstoqueError extends Error {}

export async function listarProdutos(busca?: string): Promise<Produto[]> {
  const termo = busca?.trim();
  const { rows } = await pool.query<Produto>(
    `${SELECT_PRODUTO}
     WHERE $1::text IS NULL OR p.sku ILIKE '%' || $1 || '%' OR p.nome ILIKE '%' || $1 || '%'
     ORDER BY p.nome`,
    [termo || null],
  );
  return rows;
}

export async function buscarProduto(id: number): Promise<Produto | null> {
  const { rows } = await pool.query<Produto>(`${SELECT_PRODUTO} WHERE p.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function criarProduto(p: {
  sku: string;
  nome: string;
  unidade: string;
  estoque_minimo: number;
}): Promise<number> {
  try {
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO produtos (sku, nome, unidade, estoque_minimo)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [p.sku, p.nome, p.unidade, p.estoque_minimo],
    );
    return rows[0].id;
  } catch (e) {
    if ((e as { code?: string }).code === "23505") {
      throw new EstoqueError(`Já existe um produto com o SKU "${p.sku}".`);
    }
    throw e;
  }
}

export async function atualizarProduto(
  id: number,
  p: { sku: string; nome: string; unidade: string; estoque_minimo: number },
): Promise<void> {
  try {
    await pool.query(
      `UPDATE produtos SET sku = $2, nome = $3, unidade = $4, estoque_minimo = $5 WHERE id = $1`,
      [id, p.sku, p.nome, p.unidade, p.estoque_minimo],
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") {
      throw new EstoqueError(`Já existe um produto com o SKU "${p.sku}".`);
    }
    throw e;
  }
}

export async function excluirProduto(id: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM movimentacoes WHERE produto_id = $1", [id]);
    await client.query("DELETE FROM produtos WHERE id = $1", [id]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

export async function registrarMovimentacao(m: {
  produto_id: number;
  tipo: TipoMov;
  quantidade: number;
  documento?: string | null;
  observacao?: string | null;
}): Promise<{ saldo: number }> {
  try {
    const { rows } = await pool.query<{ saldo_apos: number }>(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, documento, observacao)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING saldo_apos`,
      [m.produto_id, m.tipo, m.quantidade, m.documento || null, m.observacao || null],
    );
    return { saldo: rows[0].saldo_apos };
  } catch (e) {
    if ((e as { code?: string }).code === "P0001") throw new EstoqueError((e as Error).message);
    throw e;
  }
}

export async function estornarMovimentacao(id: number): Promise<void> {
  try {
    const { rowCount } = await pool.query(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, documento, observacao, estorno_de)
       SELECT produto_id, CASE tipo WHEN 'ENTRADA' THEN 'SAIDA' ELSE 'ENTRADA' END, quantidade, documento,
              'Estorno do lançamento #' || id, id
       FROM movimentacoes WHERE id = $1 AND estorno_de IS NULL
         AND NOT EXISTS (SELECT 1 FROM movimentacoes e WHERE e.estorno_de = $1)`,
      [id],
    );
    if (rowCount === 0) throw new EstoqueError("Este lançamento já foi desfeito ou é um estorno.");
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "23505") throw new EstoqueError("Este lançamento já foi desfeito.");
    if (code === "P0001") throw new EstoqueError((e as Error).message);
    throw e;
  }
}

export async function listarMovimentacoes(filtro: {
  produto_id?: number;
  tipo?: TipoMov;
  limite?: number;
}): Promise<Movimentacao[]> {
  const { rows } = await pool.query<Movimentacao>(
    `SELECT m.*, p.sku, p.nome, p.unidade,
       EXISTS (SELECT 1 FROM movimentacoes e WHERE e.estorno_de = m.id) AS estornada
     FROM movimentacoes m JOIN produtos p ON p.id = m.produto_id
     WHERE ($1::int IS NULL OR m.produto_id = $1)
       AND ($2::text IS NULL OR m.tipo = $2)
     ORDER BY m.criado_em DESC, m.id DESC
     LIMIT $3`,
    [filtro.produto_id ?? null, filtro.tipo ?? null, filtro.limite ?? 200],
  );
  return rows;
}

export async function resumo() {
  const { rows } = await pool.query<{
    total_produtos: number;
    abaixo_minimo: number;
    entradas_hoje: number;
    saidas_hoje: number;
  }>(
    `SELECT
       (SELECT count(*)::int FROM produtos) AS total_produtos,
       (SELECT count(*)::int FROM produtos WHERE saldo <= estoque_minimo) AS abaixo_minimo,
       (SELECT count(*)::int FROM movimentacoes WHERE tipo = 'ENTRADA' AND criado_em >= current_date) AS entradas_hoje,
       (SELECT count(*)::int FROM movimentacoes WHERE tipo = 'SAIDA' AND criado_em >= current_date) AS saidas_hoje`,
  );
  return rows[0];
}

export async function produtosAbaixoDoMinimo(): Promise<Produto[]> {
  const { rows } = await pool.query<Produto>(
    `${SELECT_PRODUTO} WHERE p.saldo <= p.estoque_minimo ORDER BY (p.saldo - p.estoque_minimo), p.nome`,
  );
  return rows;
}
