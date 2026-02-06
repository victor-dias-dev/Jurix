import { IsOptional, IsEnum, IsString, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ContractStatus } from '../../../common/enums';

export class FilterContractDto {
  @IsOptional()
  @IsEnum(ContractStatus, { message: 'Status inválido' })
  status?: ContractStatus;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data inicial inválida' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Data final inválida' })
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Ordem inválida' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

