import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    example: 'jane.doe@acme.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'Str0ng!Pass#2024',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({
    example: '123456',
    description: 'TOTP MFA code (required if MFA is enabled on the account)',
    minLength: 6,
    maxLength: 6,
  })
  @IsOptional()
  @IsString()
  @Length(6, 6, { message: 'MFA code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'MFA code must consist of 6 digits' })
  mfaCode?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token issued at login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'jane.doe@acme.com',
    description: 'Email address to send reset link to',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'NewStr0ng!Pass#2024',
    description: 'New password',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+={}[\]|:;"'<>,.?/~`\\])/,
    {
      message:
        'Password must contain uppercase, lowercase, digit, and special character',
    },
  )
  newPassword: string;
}

export class VerifyMfaDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit TOTP code from authenticator app',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'MFA code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'MFA code must consist of 6 digits' })
  code: string;
}
