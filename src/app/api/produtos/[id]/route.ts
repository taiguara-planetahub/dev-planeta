// =================================================================
// API ROUTE: /api/produtos/[id]
// =================================================================
// Este arquivo define a rota de API para DELETAR um produto específico.
// O "[id]" no nome da pasta é uma "rota dinâmica" do Next.js:
// ele captura o valor passado na URL e o disponibiliza como parâmetro.
//
// Exemplo: DELETE /api/produtos/5 → params.id = "5"
//
// Método implementado:
//   DELETE → Remove um produto pelo seu ID
// =================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =================================================================
// DELETE /api/produtos/[id] - Deletar um produto
// =================================================================
// Esta função é chamada quando o frontend faz um fetch DELETE para
// "/api/produtos/123" (onde 123 é o ID do produto a ser removido).
// O Next.js extrai automaticamente o "id" da URL e passa como parâmetro.
// =================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtém o ID da URL. Como é uma rota dinâmica, o parâmetro
    // vem como string e precisa ser convertido para número inteiro.
    const { id } = await params;
    const produtoId = parseInt(id);

    // Validação: verifica se o ID é um número válido
    if (isNaN(produtoId)) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

    // "delete" remove o registro com o ID especificado.
    // O "where" indica qual registro deve ser deletado.
    await prisma.produto.delete({
      where: { id: produtoId },
    });

    // Retorna uma mensagem de sucesso com status 200
    return NextResponse.json({ message: "Produto deletado com sucesso." });
  } catch (error: unknown) {
    console.error("Erro ao deletar produto:", error);

    // Tratamento de erro: produto não encontrado
    // O Prisma retorna o código "P2025" quando o registro não existe.
    if (
      error instanceof Error &&
      "code" in error &&
      (error as Record<string, unknown>).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao deletar produto." },
      { status: 500 }
    );
  }
}
