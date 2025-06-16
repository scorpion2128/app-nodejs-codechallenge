import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  MAX_ALLOWED_TRANSACTION_VALUE,
  ALLOWED_TRANSACTION_STATUSES,
  TransactionStatus,
} from '../constants/transaction.constants';
import { PrismaClient } from '@prisma/client';

export class TransactionValidator {
  constructor(private readonly prisma: PrismaClient) {}

  async validateTransferTypeExists(id: number) {
    const type = await this.prisma.transactionType.findUnique({
      where: { id },
    });
    if (!type) {
      throw new BadRequestException('The transaction type does not exist');
    }
  }

  validateAccountsAreDifferent(debit: string, credit: string) {
    if (debit === credit) {
      throw new BadRequestException(
        'The source and destination accounts cannot be the same.',
      );
    }
  }

  validateTransactionValue(value: number): 'PENDING' | 'REJECTED' {
    return value > MAX_ALLOWED_TRANSACTION_VALUE ? 'REJECTED' : 'PENDING';
  }

  validateStatusIsAllowed(status: string) {
    if (
      !ALLOWED_TRANSACTION_STATUSES.includes(
        status.toUpperCase() as TransactionStatus,
      )
    ) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
  }

  validateStatusIsPending(currentStatus: string) {
    if (currentStatus !== 'PENDING') {
      throw new ConflictException(
        'Only transactions in PENDING status can be updated.',
      );
    }
  }
}
