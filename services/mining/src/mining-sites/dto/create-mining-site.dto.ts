import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  IsUUID,
  Min,
  Max,
  Length,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum MineType {
  OPEN_PIT = 'OPEN_PIT',
  UNDERGROUND = 'UNDERGROUND',
  ALLUVIAL = 'ALLUVIAL',
  QUARRY = 'QUARRY',
  STRIP = 'STRIP',
  PLACER = 'PLACER',
}

export enum OreType {
  GOLD = 'GOLD',
  COPPER = 'COPPER',
  IRON = 'IRON',
  COAL = 'COAL',
  BAUXITE = 'BAUXITE',
  SILVER = 'SILVER',
  ZINC = 'ZINC',
  LEAD = 'LEAD',
  NICKEL = 'NICKEL',
  LITHIUM = 'LITHIUM',
  COBALT = 'COBALT',
  DIAMOND = 'DIAMOND',
  LIMESTONE = 'LIMESTONE',
  PHOSPHATE = 'PHOSPHATE',
  OTHER = 'OTHER',
}

export enum MineCertification {
  ISO14001 = 'ISO14001',
  ISO45001 = 'ISO45001',
  ISO9001 = 'ISO9001',
  ICMC = 'ICMC',
  TSM = 'TSM',
  IRMA = 'IRMA',
  RGS = 'RGS',
  CRAFT = 'CRAFT',
}

export enum MineStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPLORATION = 'EXPLORATION',
  DEVELOPMENT = 'DEVELOPMENT',
  CARE_AND_MAINTENANCE = 'CARE_AND_MAINTENANCE',
  CLOSED = 'CLOSED',
  REHABILITATION = 'REHABILITATION',
}

export class CreateMiningSiteDto {
  @ApiProperty({ example: 'Kibali Gold Mine', description: 'Site name' })
  @IsString()
  @Length(2, 200)
  name: string;

  @ApiProperty({ example: 'KGM-001', description: 'Unique site code' })
  @IsString()
  @Length(2, 50)
  code: string;

  @ApiProperty({ example: 'DRC', description: 'Country ISO code or name' })
  @IsString()
  @Length(2, 100)
  country: string;

  @ApiPropertyOptional({ example: 'Haut-Uélé', description: 'Region/Province' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 2.5789, description: 'Latitude' })
  @IsNumber()
  @IsLatitude()
  lat: number;

  @ApiProperty({ example: 30.1234, description: 'Longitude' })
  @IsNumber()
  @IsLongitude()
  lng: number;

  @ApiProperty({ enum: MineType, example: MineType.OPEN_PIT })
  @IsEnum(MineType)
  type: MineType;

  @ApiProperty({ enum: OreType, example: OreType.GOLD })
  @IsEnum(OreType)
  primaryOreType: OreType;

  @ApiPropertyOptional({ example: 25000000, description: 'Proved + probable reserves (tonnes)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reservesTonnes?: number;

  @ApiPropertyOptional({ example: 12, description: 'Estimated life of mine (years)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  @Type(() => Number)
  lifeOfMineYears?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Target daily ore production (tonnes)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  targetDailyProductionTonnes?: number;

  @ApiPropertyOptional({ example: 'CAMI-2024-0451', description: 'Mining concession number' })
  @IsOptional()
  @IsString()
  concessionNumber?: string;

  @ApiPropertyOptional({ example: '2035-12-31', description: 'Concession expiry date' })
  @IsOptional()
  @IsDateString()
  concessionExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Operator company ID (UUID)' })
  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @ApiPropertyOptional({ enum: MineStatus, default: MineStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MineStatus)
  status?: MineStatus;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [String],
    enum: MineCertification,
    example: [MineCertification.ISO14001, MineCertification.ISO45001],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MineCertification, { each: true })
  certifications?: MineCertification[];

  @ApiPropertyOptional({ example: 'en', description: 'Primary operating language' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'USD', description: 'Operating currency' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Tenant ID for multi-tenancy' })
  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class UpdateMiningSiteDto extends CreateMiningSiteDto {}

export class CreateMiningZoneDto {
  @ApiProperty({ example: 'Zone Alpha', description: 'Zone name' })
  @IsString()
  @Length(2, 200)
  name: string;

  @ApiProperty({ example: 'Z-A1', description: 'Zone code' })
  @IsString()
  @Length(2, 50)
  code: string;

  @ApiPropertyOptional({ example: 'Northern open pit sector' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 45.5, description: 'Zone area in hectares' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  areaHectares?: number;

  @ApiPropertyOptional({ example: -250, description: 'Depth/elevation in metres (negative = below surface)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  depthMetres?: number;

  @ApiPropertyOptional({ example: 3.5, description: 'Average ore grade (g/t Au or %)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  averageGrade?: number;

  @ApiPropertyOptional({ example: 'g/t', description: 'Grade unit' })
  @IsOptional()
  @IsString()
  gradeUnit?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
