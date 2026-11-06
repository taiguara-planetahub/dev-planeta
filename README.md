# Controle de Estoque

Controle simples de estoque: cadastro de produtos, **entradas** e **saídas**, saldo atual, alerta de estoque mínimo e histórico de movimentações.

Stack: Next.js 16 (App Router + Server Actions) · TypeScript · PostgreSQL 17 · Tailwind CSS 4.

## Como rodar (local)

Pré-requisitos: Node.js 20+ e Docker Desktop.

```bash
npm install
npm run db:up        # sobe o PostgreSQL no Docker (porta 5432)
npm run db:migrate   # cria as tabelas (pode rodar quantas vezes quiser)
npm run prod         # versão rápida em http://localhost:3000 (use npm run dev só para programar)
```

A conexão fica em `.env.local` (`DATABASE_URL`). Para usar um Postgres já instalado, troque a URL e rode `npm run db:migrate`.

## Telas

| Rota | O que faz |
|---|---|
| `/` | Painel: cadastro de produto, totais, estoque baixo, últimas movimentações |
| `/produtos` | Estoque: lista de produtos com busca + registro de entrada e saída |
| `/produtos/[id]` | Detalhe, histórico do produto, editar, excluir |
| `/movimentacoes` | Histórico com filtro por tipo e produto |

## Regras de negócio

- O saldo **só muda por movimentação** — não é editável manualmente, para o histórico sempre bater.
- A regra do saldo fica **no banco** (trigger `trg_aplicar_movimentacao`): todo `INSERT` em `movimentacoes`, pela tela ou direto por SQL, atualiza o saldo do produto e preenche o `saldo_apos`.
- Saída maior que o saldo é **recusada** ("Saldo insuficiente"), inclusive com duas saídas simultâneas.
- Cada movimentação guarda o `saldo_apos`, documento (NF/pedido) e observação.
- Quantidades aceitam decimais (até 3 casas), para itens em KG, L etc.
- Produto pode ser excluído pela aba Estoque ou pela página dele; se tiver movimentações, o sistema avisa e apaga o histórico junto.

Lançamento direto pelo banco:

```sql
INSERT INTO movimentacoes (produto_id, tipo, quantidade, documento) VALUES (1, 'ENTRADA', 50, 'NF 123');
INSERT INTO movimentacoes (produto_id, tipo, quantidade) VALUES (1, 'SAIDA', 5);
```

Só o `INSERT` passa pelo trigger. Apagar ou alterar uma movimentação, ou mudar `produtos.saldo` direto, não recalcula nada — para corrigir um lançamento, lance uma movimentação contrária.

## Estrutura

```
db/schema.sql                 tabelas produtos e movimentacoes
scripts/migrate.mjs           aplica o schema
src/lib/db.ts                 pool de conexão (pg)
src/lib/estoque.ts            consultas e regra de entrada/saída
src/app/actions.ts            server actions + validação (zod)
src/app/...                   páginas
src/components/...            formulários e tabelas
```
