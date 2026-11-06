import { notFound } from "next/navigation";
import ProdutoForm from "@/components/ProdutoForm";
import { PageHeader, cardCls } from "@/components/ui";
import { buscarProduto } from "@/lib/estoque";

export const dynamic = "force-dynamic";

export default async function EditarProdutoPage({ params }: PageProps<"/produtos/[id]/editar">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const produto = await buscarProduto(id);
  if (!produto) notFound();

  return (
    <div className="max-w-xl">
      <PageHeader
        title={`Editar: ${produto.nome}`}
        description="O saldo só muda por entradas e saídas, para manter o histórico correto."
      />
      <div className={`${cardCls} p-5`}>
        <ProdutoForm produto={produto} />
      </div>
    </div>
  );
}
