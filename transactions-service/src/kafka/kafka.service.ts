import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({ brokers: ['localhost:9092'] });
  private producer: Producer;
  private consumer: Consumer;

  async onModuleInit() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emit(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  }

  async consumeTransactionStatus(
    callback: (data: {
      transactionExternalId: string;
      status: string;
    }) => Promise<void>,
  ) {
    this.consumer = this.kafka.consumer({
      groupId: 'transaction-status-group',
    });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'transaction.status',
      fromBeginning: false,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        const raw = message.value.toString();

        let data: { transactionExternalId: string; status: string };
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data = JSON.parse(raw);
        } catch (err) {
          console.error('Error parsing Kafka message:', raw, err);
          return;
        }

        await callback(data);
      },
    });
  }
}
