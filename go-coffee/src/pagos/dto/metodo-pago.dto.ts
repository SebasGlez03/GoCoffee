import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class MetodoPagoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/\S/)
  titular!: string;

  @IsIn(['VISA', 'MASTERCARD', 'AMEX', 'OTRA'])
  marca!: string;

  @Matches(/^\d{4}$/)
  ultimos4!: string;
}
