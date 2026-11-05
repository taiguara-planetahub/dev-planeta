# 📦 MVP - Gestão de Produtos (Fullstack Next.js + Prisma + PostgreSQL)

Projeto desenvolvido como MVP para teste técnico de nível Júnior, utilizando **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM** e **PostgreSQL**.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend (Fullstack):** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **ORM:** Prisma v6
- **Banco de Dados:** PostgreSQL 16 (via Docker)

---

## 📂 Estrutura de Pastas

```text
c:\dev-planeta\
├── prisma\
│   ├── schema.prisma          # Modelagem da tabela Produto com Prisma
│   └── migrations\            # Histórico das migrações SQL
├── src\
│   ├── app\
│   │   ├── api\
│   │   │   └── produtos\
│   │   │       ├── route.ts         # GET (listar) e POST (cadastrar)
│   │   │       └── [id]\
│   │   │           └── route.ts     # DELETE (deletar por ID)
│   │   ├── globals.css        # Configurações do Tailwind CSS
│   │   ├── layout.tsx         # Layout raiz da aplicação
│   │   └── page.tsx           # UI reativa (Formulário + Tabela)
│   └── lib\
│       └── prisma.ts          # Instância singleton do Prisma Client
├── .env                       # Variável DATABASE_URL para conexão
├── docker-compose.yml         # Subida rápida do PostgreSQL
└── package.json
```

---

## 🚀 Como Executar o Projeto

### 1. Iniciar o Banco PostgreSQL via Docker
```bash
docker compose up -d
```
*(O container `postgres-planeta` já foi provisionado na porta `5432`)*

### 2. Executar as Migrations do Prisma
```bash
npx prisma migrate dev
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Acesse a aplicação no navegador em: **[http://localhost:3000](http://localhost:3000)**

---

## 🧭 Arquitetura e Conceitos Didáticos para Explicação Técnica

1. **Next.js App Router & Rota Dinâmica:**
   - As rotas da API ficam em `src/app/api/produtos/route.ts` para coleções (`GET`, `POST`).
   - Rotas dinâmicas como `src/app/api/produtos/[id]/route.ts` capturam parâmetros de rota no próprio nome da pasta (`[id]`).

2. **Prisma Client Singleton (`src/lib/prisma.ts`):**
   - No ambiente de desenvolvimento do Next.js, o hot-reloading pode recriar novas conexões com o PostgreSQL a cada salvamento. O padrão Singleton no `globalThis` impede o esgotamento do pool de conexões do banco.

3. **Frontend Reativo (`src/app/page.tsx`):**
   - Utiliza `"use client"` para permitir hooks do React (`useState` para controle do formulário e lista, `useEffect` para carregar dados na montagem do componente).
   - O CRUD é executado assincronamente via `fetch` direto nas rotas internas `/api/produtos`, com tratamento de erros e atualização instantânea de estado.
