// =================================================================
// API ROUTE: /api/produtos
// =================================================================
// Este arquivo define as rotas de API para LISTAR e CRIAR produtos.
// No Next.js App Router, cada arquivo "route.ts" dentro de "app/api"
// se torna um endpoint da API automaticamente.
//
// Métodos implementados:
//   GET  → Lista todos os produtos cadastrados
//   POST → Cria um novo produto no banco de dados
//
// O Next.js mapeia automaticamente as funções exportadas
// (GET, POST, PUT, DELETE, etc.) para os métodos HTTP correspondentes.
// =================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =================================================================
// GET /api/produtos - Listar todos os produtos
// =================================================================
// Esta função é chamada quando o frontend faz um fetch GET para
// "/api/produtos". Ela busca todos os registros da tabela Produto
// e retorna como JSON, ordenados do mais recente para o mais antigo.
// =================================================================
export async function GET() {
  try {
    // O Prisma Client oferece métodos tipados para cada model.
    // "findMany" busca múltiplos registros. O "orderBy" ordena
    // pelo campo "createdAt" em ordem decrescente (mais recente primeiro).
    const produtos = await prisma.produto.findMany({
      orderBy: { createdAt: "desc" },
    });

    // NextResponse.json() serializa o array de produtos em JSON
    // e retorna com status 200 (sucesso) automaticamente.
    return NextResponse.json(produtos);
  } catch (error) {
    // Em caso de erro, retorna status 500 (erro interno do servidor)
    console.error("Erro ao listar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos." },
      { status: 500 }
    );
  }
}

// =================================================================
// POST /api/produtos - Criar um novo produto
// =================================================================
// Esta função é chamada quando o frontend envia um fetch POST com
// os dados do novo produto no corpo (body) da requisição.
// Ela valida os campos obrigatórios e cria o registro no banco.
// =================================================================
export async function POST(request: NextRequest) {
  try {
    // Extrai os dados enviados pelo frontend no corpo da requisição.
    // O "await request.json()" faz o parse do JSON recebido.
    const body = await request.json();
    const { nome, valor, tipo, peso } = body;

    // Validação simples: verifica se todos os campos foram preenchidos.
    // Em um projeto real, usaríamos uma biblioteca como Zod para validação.
    if (!nome || valor === undefined || !tipo || peso === undefined) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios: nome, valor, tipo, peso." },
        { status: 400 }
      );
    }

    // "create" insere um novo registro na tabela Produto.
    // O campo "data" recebe os valores que serão salvos.
    // Os campos "id" e "createdAt" são preenchidos automaticamente.
    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        valor: parseFloat(valor),
        tipo,
        peso: parseFloat(peso),
      },
    });

    // Retorna o produto criado com status 201 (recurso criado com sucesso)
    return NextResponse.json(novoProduto, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro ao criar produto:", error);

    // Tratamento de erro específico: nome duplicado (violação de unicidade)
    // O Prisma retorna o código "P2002" quando há violação de constraint unique.
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Já existe um produto com esse nome." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar produto." },
      { status: 500 }
    );
  }
}
