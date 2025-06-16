import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTransactionTypes() {
  const existing = await prisma.transactionType.findFirst();

  if (!existing) {
    await prisma.transactionType.createMany({
      data: [{ name: 'Transfer' }, { name: 'Deposit' }, { name: 'Withdrawal' }],
    });
    console.log('Initial transaction types inserted');
  } else {
    console.log('Transaction types already exist. Seed omitted');
  }
}
