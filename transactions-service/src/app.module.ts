import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { KafkaModule } from './kafka/kafka.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [KafkaModule, PrismaModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
