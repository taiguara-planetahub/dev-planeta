// =================================================================
// PÁGINA PRINCIPAL - Gestão de Produtos
// =================================================================
// Este é o componente principal da aplicação. Ele contém:
//   1. O formulário para cadastrar novos produtos
//   2. A tabela que exibe todos os produtos cadastrados
//   3. A lógica para conectar o frontend com a API (fetch)
//
// A diretiva "use client" indica que este componente roda no NAVEGADOR
// (client-side). Isso é necessário porque usamos hooks do React
// (useState, useEffect) que só funcionam no lado do cliente.
// =================================================================
"use client";

import { useState, useEffect } from "react";

// =================================================================
// Interface TypeScript para definir a estrutura de um Produto
// =================================================================
// O TypeScript nos permite definir "tipos" para nossos dados.
// Isso garante que sempre trabalharemos com objetos que tenham
// exatamente esses campos, evitando erros em tempo de desenvolvimento.
// =================================================================
interface Produto {
  id: number;
  nome: string;
  valor: number;
  tipo: string;
  peso: number;
  createdAt: string;
}

export default function Home() {
  // =================================================================
  // ESTADOS DO REACT (useState)
  // =================================================================
  // Estados são variáveis reativas: quando seu valor muda, o React
  // re-renderiza automaticamente os componentes que dependem delas.
  //
  // - produtos:   Array com a lista de produtos vindos do banco
  // - nome/valor/tipo/peso: Valores dos campos do formulário
  // - carregando: Indica se uma operação está em andamento (loading)
  // - erro:       Armazena mensagens de erro para exibir ao usuário
  // =================================================================
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");
  const [peso, setPeso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // =================================================================
  // useEffect - Carrega os produtos ao abrir a página
  // =================================================================
  // O useEffect executa uma função quando o componente é montado
  // (aparece na tela). O array vazio [] no segundo argumento indica
  // que deve executar apenas UMA vez, ao carregar a página.
  // =================================================================
  useEffect(() => {
    buscarProdutos();
  }, []);

  // =================================================================
  // FUNÇÃO: Buscar todos os produtos da API
  // =================================================================
  // Faz uma requisição GET para "/api/produtos" e atualiza o estado
  // "produtos" com os dados retornados pelo backend.
  // =================================================================
  async function buscarProdutos() {
    try {
      const resposta = await fetch("/api/produtos");
      const dados = await resposta.json();
      setProdutos(dados);
    } catch {
      setErro("Erro ao carregar produtos.");
    }
  }

  // =================================================================
  // FUNÇÃO: Cadastrar um novo produto
  // =================================================================
  // É chamada quando o formulário é submetido. Envia os dados do
  // formulário para a API via POST e, se der certo, atualiza a lista.
  // =================================================================
  async function cadastrarProduto(e: React.FormEvent) {
    // Previne o comportamento padrão do formulário (recarregar a página)
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // Faz a requisição POST enviando os dados como JSON no body
      const resposta = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, valor, tipo, peso }),
      });

      // Verifica se a resposta indica erro
      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.error || "Erro ao cadastrar produto.");
        return;
      }

      // Limpa os campos do formulário após o cadastro bem-sucedido
      setNome("");
      setValor("");
      setTipo("");
      setPeso("");

      // Recarrega a lista de produtos para exibir o novo item
      await buscarProdutos();
    } catch {
      setErro("Erro ao cadastrar produto.");
    } finally {
      // O "finally" sempre executa, independente de sucesso ou erro.
      // Aqui, desativamos o estado de "carregando".
      setCarregando(false);
    }
  }

  // =================================================================
  // FUNÇÃO: Deletar um produto
  // =================================================================
  // Envia uma requisição DELETE para a API com o ID do produto.
  // Após a exclusão, recarrega a lista para refletir a mudança.
  // =================================================================
  async function deletarProduto(id: number) {
    // Pede confirmação antes de deletar
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
      const resposta = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.error || "Erro ao deletar produto.");
        return;
      }

      // Atualiza a lista removendo o produto deletado localmente,
      // sem precisar fazer outra requisição ao servidor.
      setProdutos(produtos.filter((p) => p.id !== id));
    } catch {
      setErro("Erro ao deletar produto.");
    }
  }

  // =================================================================
  // RENDERIZAÇÃO (JSX)
  // =================================================================
  // O JSX é a sintaxe que mistura HTML com JavaScript/TypeScript.
  // Aqui definimos toda a interface visual da aplicação.
  // As classes CSS usadas são do Tailwind CSS (estilo utilitário).
  // =================================================================
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ============ TÍTULO DA APLICAÇÃO ============ */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          📦 Gestão de Produtos
        </h1>

        {/* ============ MENSAGEM DE ERRO ============ */}
        {/* Renderização condicional: só exibe se "erro" não estiver vazio */}
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {erro}
          </div>
        )}

        {/* ============ FORMULÁRIO DE CADASTRO ============ */}
        <form
          onSubmit={cadastrarProduto}
          className="bg-white shadow-md rounded-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Cadastrar Novo Produto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Nome do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Camiseta Básica"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Campo: Valor (preço) do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Ex: 49.90"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Campo: Tipo/Categoria do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tipo
              </label>
              <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ex: Vestuário"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Campo: Peso do Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 0.25"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={carregando}
            className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {carregando ? "Cadastrando..." : "Cadastrar Produto"}
          </button>
        </form>

        {/* ============ TABELA DE PRODUTOS ============ */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-700 p-6 pb-4">
            Produtos Cadastrados
          </h2>

          {/* Verifica se existem produtos para exibir */}
          {produtos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum produto cadastrado ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                      Peso
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-600">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Itera sobre cada produto e renderiza uma linha da tabela */}
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {produto.nome}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {/* Formata o valor como moeda brasileira (R$) */}
                        R$ {produto.valor.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {produto.tipo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {produto.peso.toFixed(2)} kg
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {/* Formata a data para o padrão brasileiro (dd/mm/aaaa) */}
                        {new Date(produto.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4">
                        {/* Botão para deletar o produto */}
                        <button
                          onClick={() => deletarProduto(produto.id)}
                          className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
