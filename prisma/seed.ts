import { PrismaClient, TipoMovimentacao } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes para evitar duplicidade ao rodar o seed novamente
  await prisma.movimentacao.deleteMany()
  await prisma.item.deleteMany()

  // 1. Luva de Proteção Nitrílica
  const item1 = await prisma.item.create({
    data: {
      codigo: 'EPI-001',
      nome: 'Luva de Proteção Nitrílica Tam G',
      unidade: 'par',
      quantidade: 50,
      movimentacoes: {
        create: [
          {
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: 60,
            observacao: 'Recebimento inicial NF 1042',
          },
          {
            tipo: TipoMovimentacao.SAIDA,
            quantidade: 10,
            observacao: 'Distribuição para equipe de manutenção',
          },
        ],
      },
    },
  })

  // 2. Fita Isolante 3M
  const item2 = await prisma.item.create({
    data: {
      codigo: 'ELE-002',
      nome: 'Fita Isolante 19mm x 20m',
      unidade: 'rolo',
      quantidade: 25,
      movimentacoes: {
        create: [
          {
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: 30,
            observacao: 'Aquisição via almoxarifado central',
          },
          {
            tipo: TipoMovimentacao.SAIDA,
            quantidade: 5,
            observacao: 'Uso no setor de painéis elétricos',
          },
        ],
      },
    },
  })

  // 3. Parafuso Autoatarraxante
  const item3 = await prisma.item.create({
    data: {
      codigo: 'FIX-003',
      nome: 'Parafuso Autoatarraxante 4.2 x 13mm',
      unidade: 'cx',
      quantidade: 15,
      movimentacoes: {
        create: [
          {
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: 15,
            observacao: 'Compra avulsa reposição',
          },
        ],
      },
    },
  })

  // 4. Óculos de Segurança - Estoque Zerado para validação visual
  const item4 = await prisma.item.create({
    data: {
      codigo: 'EPI-004',
      nome: 'Óculos de Segurança Ampla Visão',
      unidade: 'un',
      quantidade: 0,
      movimentacoes: {
        create: [
          {
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: 12,
            observacao: 'Lote de teste com novo fornecedor',
          },
          {
            tipo: TipoMovimentacao.SAIDA,
            quantidade: 12,
            observacao: 'Entrega aos operadores do turno da manhã',
          },
        ],
      },
    },
  })

  // 5. Álcool Isopropílico 1L
  const item5 = await prisma.item.create({
    data: {
      codigo: 'QUI-005',
      nome: 'Álcool Isopropílico 99.8% 1L',
      unidade: 'frasco',
      quantidade: 8,
      movimentacoes: {
        create: [
          {
            tipo: TipoMovimentacao.ENTRADA,
            quantidade: 10,
            observacao: 'Estoque laboratório de eletrônica',
          },
          {
            tipo: TipoMovimentacao.SAIDA,
            quantidade: 2,
            observacao: 'Limpeza de placas na bancada 3',
          },
        ],
      },
    },
  })

  console.log('Seed executado com sucesso!')
  console.log({ item1: item1.codigo, item2: item2.codigo, item3: item3.codigo, item4: item4.codigo, item5: item5.codigo })
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
