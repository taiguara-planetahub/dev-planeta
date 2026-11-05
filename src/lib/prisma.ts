// =================================================================
// PRISMA CLIENT - Instância Singleton
// =================================================================
// Este arquivo cria uma única instância do Prisma Client para toda
// a aplicação. Isso é importante porque:
//
// 1. Em desenvolvimento, o Next.js faz "hot reload" (recarrega o código
//    a cada mudança). Sem este padrão, cada reload criaria uma NOVA
//    conexão com o banco, esgotando rapidamente o limite de conexões.
//
// 2. Usando o objeto "global" do Node.js, garantimos que a mesma
//    instância é reaproveitada entre os reloads.
//
// 3. Em produção, isso não é necessário (não tem hot reload), mas
//    o padrão funciona corretamente em ambos os ambientes.
// =================================================================

import { PrismaClient } from "@prisma/client";

// Declara a variável "prisma" no escopo global do Node.js
// para que ela persista entre os hot reloads do Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Se já existe uma instância no global, reutiliza.
// Caso contrário, cria uma nova instância do PrismaClient.
const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Em desenvolvimento, armazena a instância no global para reaproveitamento
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
