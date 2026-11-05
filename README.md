# Controle de Estoque de Almoxarifado

Sistema web completo e enxuto para controle de estoque de almoxarifado corporativo, permitindo o cadastro de materiais e o registro de movimentações de **Entrada** e **Saída**, com histórico rastreável, estorno e garantia de integridade transacional.

---

## 🛠 Stack Tecnológica

- **Framework**: Next.js (App Router, React 19)
- **Linguagem**: TypeScript (Strict Mode)
- **Estilização**: Tailwind CSS v4
- **ORM**: Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Arquitetura**: Server Components + Server Actions nativas (sem bibliotecas extras de UI ou formulários)

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v20+ recomendado)
- PostgreSQL rodando localmente ou via container Docker

### Passo a passo

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Configurar as variáveis de ambiente:**
   Copie o arquivo de exemplo e configure a string de conexão com o banco:
   ```bash
   cp .env.example .env
   ```
   *Exemplo de URL no `.env`:*
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/almoxarifado?schema=public"
   ```

3. **Executar as migrações do banco de dados:**
   ```bash
   npx prisma migrate dev
   ```

4. **Popular o banco com dados de teste (Seed):**
   ```bash
   npx prisma db seed
   ```

5. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 💡 Decisões Técnicas

- **Server Components Exclusivos na Página Principal**: Todo o carregamento de dados ocorre no lado do servidor via Prisma, eliminando chamadas de API intermediárias (`fetch`/`route handlers`) e reduzindo a carga do cliente.
- **Server Actions com Formulários Nativos**: Os formulários utilizam HTML padrão (`<form action={action}>`), aproveitando validações nativas do navegador (`required`, `min="1"`, `type="number"`) e garantindo funcionamento robusto sem dependências externas de formulários ou gerenciamento de estado cliente.
- **Integridade Transacional (`prisma.$transaction`)**:
  - **Criação de Movimentação**: O ajuste de saldo e o registro do histórico são executados na mesma transação atômica. Para saídas, valida-se rigorosamente que o saldo atual seja suficiente, prevenindo estoque negativo.
  - **Exclusão e Estorno**: A remoção de uma movimentação estorna automaticamente o saldo no item (subtraindo no caso de estorno de entrada, e somando no caso de estorno de saída), com validação preventiva para que o estorno de entrada não deixe o saldo negativo.
- **Relacionamento com Deleção em Cascata**: Configuração `onDelete: Cascade` na relação entre `Item` e `Movimentacao`, garantindo integridade referencial ao excluir itens.
- **UX & Destaque Visual para Estoque Zerado**: Linhas e badges na tabela recebem destaque diferenciado em vermelho quando o saldo de um material chega a zero, facilitando a identificação imediata pela equipe do almoxarifado.
- **Tratamento de Erros com `error.tsx`**: Tratamento declarativo com Error Boundary do Next.js para exibir mensagens claras caso uma regra de negócio (ex.: tentativa de retirar saldo insuficiente) seja violada.
