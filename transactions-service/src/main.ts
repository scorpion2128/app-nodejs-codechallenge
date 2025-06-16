import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { KafkaService } from './kafka/kafka.service';
import { TransactionsService } from './transactions/transactions.service';
import { seedTransactionTypes } from '../prisma/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await seedTransactionTypes();

  const kafkaService = app.get(KafkaService);
  const transactionsService = app.get(TransactionsService);

  await kafkaService.consumeTransactionStatus(
    async ({ transactionExternalId, status }) => {
      await transactionsService.updateStatus(transactionExternalId, status);
      console.log(`Estado actualizado: ${transactionExternalId} → ${status}`);
    },
  );

  await app.listen(3000);
}
bootstrap();
