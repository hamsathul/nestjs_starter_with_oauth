import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from '../../dto/create-permission.dto';
import { Auth } from '../../decorators/auth.decorator';

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 409, description: 'Permission already exists' })
  @Auth('super-admin')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    const permission = await this.permissionService.create(createPermissionDto);
    return {
      message: 'Permission created successfully',
      permission,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @Auth('admin', 'super-admin')
  async findAll() {
    const permissions = await this.permissionService.findAll();
    return {
      message: 'Permissions retrieved successfully',
      permissions,
    };
  }

  @Get('by-resource')
  @ApiOperation({ summary: 'Get permissions by resource (Admin only)' })
  @ApiQuery({ name: 'resource', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @Auth('admin', 'super-admin')
  async findByResource(@Query('resource') resource: string) {
    const permissions = await this.permissionService.findByResource(resource);
    return {
      message: 'Permissions retrieved successfully',
      permissions,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Auth('admin', 'super-admin')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const permission = await this.permissionService.findById(id);
    return {
      message: 'Permission retrieved successfully',
      permission,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Auth('super-admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: Partial<CreatePermissionDto>,
  ) {
    const permission = await this.permissionService.update(id, updatePermissionDto);
    return {
      message: 'Permission updated successfully',
      permission,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @Auth('super-admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.permissionService.delete(id);
    return {
      message: 'Permission deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle permission active status (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission status updated successfully' })
  @Auth('super-admin')
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    const permission = await this.permissionService.toggleStatus(id);
    return {
      message: 'Permission status updated successfully',
      permission,
    };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default permissions (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Default permissions seeded successfully' })
  @Auth('super-admin')
  async seedDefaultPermissions() {
    await this.permissionService.seedDefaultPermissions();
    return {
      message: 'Default permissions seeded successfully',
    };
  }
}
