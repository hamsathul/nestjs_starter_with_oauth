import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Manager role with specific permissions', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [String], required: false, description: 'Array of permission IDs' })
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];
}
