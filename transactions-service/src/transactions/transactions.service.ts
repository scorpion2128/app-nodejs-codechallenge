import { PrismaService } from 'prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { KafkaService } from 'src/kafka/kafka.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionValidator } from '../validators/ transaction.validator';

@Injectable()
export class TransactionsService {
  private readonly validator: TransactionValidator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaService,
  ) {
    this.validator = new TransactionValidator(prisma);
  }

  async create(createDto: CreateTransactionDto) {
    const transactionExternalId = uuidv4();

    await this.validator.validateTransferTypeExists(createDto.transferTypeId);

    this.validator.validateAccountsAreDifferent(
      createDto.accountExternalIdDebit,
      createDto.accountExternalIdCredit,
    );

    const existing = await this.prisma.transaction.findUnique({
      where: { transactionExternalId },
    });
    if (existing) {
      throw new ConflictException('A transaction with this ID already exists');
    }

    const status = this.validator.validateTransactionValue(createDto.value);

    const transaction = await this.prisma.transaction.create({
      data: {
        transactionExternalId,
        ...createDto,
        transactionStatus: status,
      },
    });

    if (status === 'PENDING') {
      await this.kafkaService.emit('transaction.created', {
        transactionExternalId,
        value: createDto.value,
      });
    }

    return transaction;
  }

  async findByExternalId(
    transactionExternalId: string,
  ): Promise<TransactionResponseDto | null> {
    const tx = await this.prisma.transaction.findUnique({
      where: { transactionExternalId },
      include: { transactionType: true },
    });

    if (!tx) return null;

    return new TransactionResponseDto(tx);
  }

  async findAll(): Promise<TransactionResponseDto[]> {
    const txs = await this.prisma.transaction.findMany({
      include: { transactionType: true },
    });

    return txs.map((tx) => new TransactionResponseDto(tx));
  }

  async updateStatus(transactionExternalId: string, status: string) {
    this.validator.validateStatusIsAllowed(status);

    const transaction = await this.prisma.transaction.findUnique({
      where: { transactionExternalId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    this.validator.validateStatusIsPending(transaction.transactionStatus);

    return this.prisma.transaction.update({
      where: { transactionExternalId },
      data: { transactionStatus: status.toUpperCase() },
    });
  }
}
