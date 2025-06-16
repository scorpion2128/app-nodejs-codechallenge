import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    const transaction =
      await this.transactionsService.create(createTransactionDto);
    return { transactionExternalId: transaction.transactionExternalId };
  }

  @Get(':transactionExternalId')
  async findOne(@Param('transactionExternalId') id: string) {
    return this.transactionsService.findByExternalId(id);
  }

  @Get()
  async findAll() {
    return this.transactionsService.findAll();
  }
}
