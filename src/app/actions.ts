'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { TipoMovimentacao } from '@prisma/client'

/**
 * Cria um novo item no almoxarifado.
 * Valida o preenchimento dos campos obrigatórios e a unicidade do código.
 */
export async function createItem(formData: FormData): Promise<void> {
  const nome = formData.get('nome')?.toString().trim()
  const codigo = formData.get('codigo')?.toString().trim().toUpperCase()
  const unidade = formData.get('unidade')?.toString().trim().toLowerCase()
  const quantidadeRaw = formData.get('quantidade')?.toString().trim()

  if (!nome) {
    throw new Error('O nome do item é obrigatório.')
  }

  if (!codigo) {
    throw new Error('O código do item é obrigatório.')
  }

  if (!unidade) {
    throw new Error('A unidade de medida é obrigatória (ex.: un, cx, kg).')
  }

  const quantidadeInicial = quantidadeRaw ? parseInt(quantidadeRaw, 10) : 0
  if (isNaN(quantidadeInicial) || quantidadeInicial < 0) {
    throw new Error('A quantidade inicial não pode ser negativa.')
  }

  const itemExistente = await prisma.item.findUnique({
    where: { codigo },
  })

  if (itemExistente) {
    throw new Error(`Já existe um item cadastrado com o código "${codigo}".`)
  }

  if (quantidadeInicial > 0) {
    await prisma.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          nome,
          codigo,
          unidade,
          quantidade: quantidadeInicial,
        },
      })

      await tx.movimentacao.create({
        data: {
          itemId: item.id,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade: quantidadeInicial,
          observacao: 'Saldo inicial de cadastro',
        },
      })
    })
  } else {
    await prisma.item.create({
      data: {
        nome,
        codigo,
        unidade,
        quantidade: 0,
      },
    })
  }

  revalidatePath('/')
}

/**
 * Remove um item do almoxarifado.
 * As movimentações associadas são removidas automaticamente via onDelete: Cascade.
 */
export async function deleteItem(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString().trim()

  if (!id) {
    throw new Error('ID do item não informado.')
  }

  const item = await prisma.item.findUnique({
    where: { id },
  })

  if (!item) {
    throw new Error('Item não encontrado para exclusão.')
  }

  await prisma.item.delete({
    where: { id },
  })

  revalidatePath('/')
}

/**
 * Registra uma nova movimentação (ENTRADA ou SAÍDA) e atualiza o saldo do item.
 * Executado atomicamente dentro de uma transação.
 * Uma SAÍDA não é permitida se o saldo for insuficiente.
 */
export async function createMovimentacao(formData: FormData): Promise<void> {
  const itemId = formData.get('itemId')?.toString().trim()
  const tipoRaw = formData.get('tipo')?.toString().trim()
  const quantidadeRaw = formData.get('quantidade')?.toString().trim()
  const observacao = formData.get('observacao')?.toString().trim() || null

  if (!itemId) {
    throw new Error('Selecione um item válido.')
  }

  if (tipoRaw !== TipoMovimentacao.ENTRADA && tipoRaw !== TipoMovimentacao.SAIDA) {
    throw new Error('Tipo de movimentação inválido. Deve ser ENTRADA ou SAIDA.')
  }

  const tipo = tipoRaw as TipoMovimentacao
  const quantidade = parseInt(quantidadeRaw || '0', 10)

  if (isNaN(quantidade) || quantidade <= 0) {
    throw new Error('A quantidade da movimentação deve ser um número inteiro maior que zero.')
  }

  await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      throw new Error('Item informado não foi encontrado.')
    }

    if (tipo === TipoMovimentacao.SAIDA && item.quantidade < quantidade) {
      throw new Error(
        `Saldo insuficiente para saída. Saldo atual: ${item.quantidade} ${item.unidade}, quantidade solicitada: ${quantidade} ${item.unidade}.`
      )
    }

    const novoSaldo =
      tipo === TipoMovimentacao.ENTRADA
        ? item.quantidade + quantidade
        : item.quantidade - quantidade

    await tx.item.update({
      where: { id: itemId },
      data: {
        quantidade: novoSaldo,
      },
    })

    await tx.movimentacao.create({
      data: {
        itemId,
        tipo,
        quantidade,
        observacao,
      },
    })
  })

  revalidatePath('/')
}

/**
 * Remove uma movimentação e estorna o saldo correspondente no item.
 * Executado atomicamente dentro de uma transação.
 */
export async function deleteMovimentacao(formData: FormData): Promise<void> {
  const id = formData.get('id')?.toString().trim()

  if (!id) {
    throw new Error('ID da movimentação não informado.')
  }

  await prisma.$transaction(async (tx) => {
    const movimentacao = await tx.movimentacao.findUnique({
      where: { id },
      include: { item: true },
    })

    if (!movimentacao) {
      throw new Error('Movimentação não encontrada para estorno.')
    }

    // Estorno:
    // Se era ENTRADA: subtrair a quantidade do saldo
    // Se era SAÍDA: somar a quantidade ao saldo
    let novoSaldo = movimentacao.item.quantidade

    if (movimentacao.tipo === TipoMovimentacao.ENTRADA) {
      if (movimentacao.item.quantidade < movimentacao.quantidade) {
        throw new Error(
          `Não é possível estornar esta entrada: o saldo atual (${movimentacao.item.quantidade} ${movimentacao.item.unidade}) ficaria negativo após subtrair ${movimentacao.quantidade}.`
        )
      }
      novoSaldo -= movimentacao.quantidade
    } else {
      novoSaldo += movimentacao.quantidade
    }

    await tx.item.update({
      where: { id: movimentacao.itemId },
      data: {
        quantidade: novoSaldo,
      },
    })

    await tx.movimentacao.delete({
      where: { id },
    })
  })

  revalidatePath('/')
}
