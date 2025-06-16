import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  accountExternalIdDebit: string;

  @IsUUID()
  accountExternalIdCredit: string;

  @IsNumber()
  transferTypeId: number;

  @IsNumber()
  @Min(0.01, { message: 'The amount must be greater than 0' })
  value: number;
}
