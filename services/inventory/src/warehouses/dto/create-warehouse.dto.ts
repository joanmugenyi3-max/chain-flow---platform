import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  Length,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum WarehouseType {
  CENTRAL = 'CENTRAL',
  REGIONAL = 'REGIONAL',
  TRANSIT = 'TRANSIT',
  RETAIL = 'RETAIL',
  MINING = 'MINING',
}

export enum CapacityUnit {
  SQM = 'SQM',
  CBM = 'CBM',
  PALLETS = 'PALLETS',
  UNITS = 'UNITS',
}

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main Distribution Center' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'WH-001', description: 'Unique warehouse code' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 20)
  code: string;

  @ApiProperty({ enum: WarehouseType, example: WarehouseType.CENTRAL })
  @IsEnum(WarehouseType)
  type: WarehouseType;

  @ApiProperty({ example: '123 Industrial Ave, Zone 5' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Accra' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Ghana' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 5.6037, description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: -0.187, description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng: number;

  @ApiProperty({ example: 50000, description: 'Total storage capacity' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  totalCapacity: number;

  @ApiProperty({ enum: CapacityUnit, example: CapacityUnit.SQM })
  @IsEnum(CapacityUnit)
  capacityUnit: CapacityUnit;

  @ApiPropertyOptional({ example: 'uuid-manager-id' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
