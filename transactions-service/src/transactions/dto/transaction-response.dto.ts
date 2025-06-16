export class TransactionResponseDto {
  transactionExternalId: string;
  transactionType: {
    name: string;
  };
  transactionStatus: {
    name: string;
  };
  value: number;
  createdAt: Date;

  constructor(tx: any) {
    this.transactionExternalId = tx.transactionExternalId;
    this.transactionType = { name: tx.transactionType.name };
    this.transactionStatus = { name: tx.transactionStatus };
    this.value = tx.value;
    this.createdAt = tx.createdAt;
  }
}