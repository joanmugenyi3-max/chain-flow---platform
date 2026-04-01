import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
  IsAlphanumeric,
  IsLowercase,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum Industry {
  RETAIL = 'RETAIL',
  MANUFACTURING = 'MANUFACTURING',
  LOGISTICS = 'LOGISTICS',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  HEALTHCARE = 'HEALTHCARE',
  AUTOMOTIVE = 'AUTOMOTIVE',
  ELECTRONICS = 'ELECTRONICS',
  CHEMICALS = 'CHEMICALS',
  MINING = 'MINING',
  AGRICULTURE = 'AGRICULTURE',
  OTHER = 'OTHER',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AUD = 'AUD',
  CAD = 'CAD',
  SGD = 'SGD',
  JPY = 'JPY',
  ZAR = 'ZAR',
}

export class RegisterDto {
  // ── Organization details ──────────────────────────────────────────────────

  @ApiProperty({
    example: 'Acme Logistics',
    description: 'Display name of the organization',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  organizationName: string;

  @ApiProperty({
    example: 'acme-logistics',
    description: 'URL-safe slug for the organization (lowercase alphanumeric + hyphens)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(63)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'organizationSlug must be lowercase alphanumeric with hyphens only (e.g. my-org)',
  })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  organizationSlug: string;

  @ApiPropertyOptional({
    enum: Industry,
    example: Industry.LOGISTICS,
    description: 'Primary industry of the organization',
  })
  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @ApiPropertyOptional({
    example: 'US',
    description: 'ISO 3166-1 alpha-2 country code',
    maxLength: 2,
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @Transform(({ value }: { value: string }) => value?.toUpperCase().trim())
  country?: string;

  @ApiPropertyOptional({
    enum: Currency,
    example: Currency.USD,
    description: 'Default billing currency',
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  // ── Admin user details ────────────────────────────────────────────────────

  @ApiProperty({ example: 'Jane', description: "Admin user's first name" })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  @Transform(({ value }: { value: string }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Doe', description: "Admin user's last name" })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  @Transform(({ value }: { value: string }) => value?.trim())
  lastName: string;

  @ApiProperty({
    example: 'jane.doe@acme.com',
    description: "Admin user's email address",
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'Str0ng!Pass#2024',
    description:
      'Password (min 8 chars, must include uppercase, lowercase, digit, and special character)',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+={}[\]|:;"'<>,.?/~`\\])/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    },
  )
  password: string;
}
