import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsPhoneNumber,
  ValidateNested,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentTerms {
  NET15 = 'NET15',
  NET30 = 'NET30',
  NET60 = 'NET60',
  NET90 = 'NET90',
  IMMEDIATE = 'IMMEDIATE',
  COD = 'COD',
}

export enum SupplierCategory {
  TECHNOLOGY = 'TECHNOLOGY',
  MANUFACTURING = 'MANUFACTURING',
  LOGISTICS = 'LOGISTICS',
  PROFESSIONAL_SERVICES = 'PROFESSIONAL_SERVICES',
  RAW_MATERIALS = 'RAW_MATERIALS',
  PACKAGING = 'PACKAGING',
  UTILITIES = 'UTILITIES',
  MARKETING = 'MARKETING',
  FACILITIES = 'FACILITIES',
  OTHER = 'OTHER',
}

export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  BLACKLISTED = 'BLACKLISTED',
  ON_HOLD = 'ON_HOLD',
}

export class BankDetailsDto {
  @ApiProperty({ example: 'First National Bank' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: 'John Doe LLC' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: '123456789' })
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({ example: '021000021' })
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiPropertyOptional({ example: 'GB29NWBK60161331926819' })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ example: 'NWBKGB2L' })
  @IsOptional()
  @IsString()
  swiftCode?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'Acme Corporation', description: 'Supplier trading name' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'SUP-001', description: 'Unique supplier code' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiPropertyOptional({ example: 'Acme Corporation Ltd.', description: 'Full legal entity name' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  legalName?: string;

  @ApiProperty({ example: 'US', description: 'ISO 3166-1 alpha-2 country code' })
  @IsString()
  @MinLength(2)
  @MaxLength(3)
  country: string;

  @ApiPropertyOptional({ example: '123 Business Ave, New York, NY 10001' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @ApiPropertyOptional({ example: 'jane.smith@acme.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ enum: SupplierCategory, example: SupplierCategory.TECHNOLOGY })
  @IsEnum(SupplierCategory)
  category: SupplierCategory;

  @ApiProperty({ enum: PaymentTerms, example: PaymentTerms.NET30 })
  @IsEnum(PaymentTerms)
  paymentTerms: PaymentTerms;

  @ApiProperty({ example: 'USD', description: 'ISO 4217 currency code' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiPropertyOptional({ example: 'US-123456789', description: 'Tax identification number' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @ApiPropertyOptional({ type: BankDetailsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BankDetailsDto)
  bankDetails?: BankDetailsDto;

  @ApiPropertyOptional({
    example: 4.5,
    description: 'Supplier rating 0-5',
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: SupplierStatus, default: SupplierStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;

  @ApiPropertyOptional({
    example: ['preferred', 'iso-certified'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Reliable supplier since 2019.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsUrl()
  website?: string;
}
