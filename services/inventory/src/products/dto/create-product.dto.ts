import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsArray,
  IsUrl,
  Min,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductCategory {
  RAW_MATERIAL = 'RAW_MATERIAL',
  EQUIPMENT = 'EQUIPMENT',
  SPARE_PARTS = 'SPARE_PARTS',
  CONSUMABLES = 'CONSUMABLES',
  FINISHED_GOODS = 'FINISHED_GOODS',
  CHEMICALS = 'CHEMICALS',
  FUEL = 'FUEL',
  SAFETY = 'SAFETY',
}

export enum ProductUnit {
  KG = 'KG',
  TON = 'TON',
  LITER = 'LITER',
  UNIT = 'UNIT',
  BOX = 'BOX',
  PALLET = 'PALLET',
  BARREL = 'BARREL',
  METER = 'METER',
}

export enum Currency {
  USD = 'USD',
  GHS = 'GHS',
  EUR = 'EUR',
  GBP = 'GBP',
}

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-001', description: 'Stock Keeping Unit' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  sku: string;

  @ApiProperty({ example: 'Heavy Duty Drill Bit Set' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 200)
  name: string;

  @ApiPropertyOptional({ example: 'Industrial grade carbide drill bits, 20-piece set' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.EQUIPMENT })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @ApiProperty({ enum: ProductUnit, example: ProductUnit.UNIT })
  @IsEnum(ProductUnit)
  unit: ProductUnit;

  @ApiPropertyOptional({ example: 2.5, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ example: 0.005, description: 'Volume in CBM' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  volume?: number;

  @ApiPropertyOptional({ example: false, description: 'Is this a hazardous material?' })
  @IsOptional()
  @IsBoolean()
  hazardous?: boolean;

  @ApiPropertyOptional({ example: 50, description: 'Minimum stock level before alert' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minStockLevel?: number;

  @ApiPropertyOptional({ example: 500, description: 'Maximum stock level' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxStockLevel?: number;

  @ApiPropertyOptional({ example: 100, description: 'Trigger reorder at this quantity' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reorderPoint?: number;

  @ApiPropertyOptional({ example: 200, description: 'Quantity to reorder' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  reorderQuantity?: number;

  @ApiPropertyOptional({ example: 45.99, description: 'Unit cost price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitCost?: number;

  @ApiPropertyOptional({ example: 59.99, description: 'Unit selling price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sellingPrice?: number;

  @ApiPropertyOptional({ enum: Currency, example: Currency.USD })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiPropertyOptional({ example: 'supplier-uuid', description: 'Primary supplier ID' })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({
    example: ['https://cdn.example.com/product1.jpg'],
    description: 'Product image URLs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
