import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user:create' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Permission to create users', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  @IsNotEmpty()
  action: string;
}
