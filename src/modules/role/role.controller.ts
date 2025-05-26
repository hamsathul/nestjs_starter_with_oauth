import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from '../../dto/create-role.dto';
import { Auth } from '../../decorators/auth.decorator';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role (Admin only)' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  @Auth('admin', 'super-admin')
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(createRoleDto);
    return {
      message: 'Role created successfully',
      role,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles (Admin only)' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @Auth('admin', 'super-admin')
  async findAll() {
    const roles = await this.roleService.findAll();
    return {
      message: 'Roles retrieved successfully',
      roles,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Auth('admin', 'super-admin')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.roleService.findById(id);
    return {
      message: 'Role retrieved successfully',
      role,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Auth('admin', 'super-admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: Partial<CreateRoleDto>,
  ) {
    const role = await this.roleService.update(id, updateRoleDto);
    return {
      message: 'Role updated successfully',
      role,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @Auth('super-admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.roleService.delete(id);
    return {
      message: 'Role deleted successfully',
    };
  }

  @Post(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Assign permission to role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission assigned successfully' })
  @Auth('admin', 'super-admin')
  async assignPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    const role = await this.roleService.assignPermission(id, permissionId);
    return {
      message: 'Permission assigned successfully',
      role,
    };
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role (Admin only)' })
  @ApiResponse({ status: 200, description: 'Permission removed successfully' })
  @Auth('admin', 'super-admin')
  async removePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    const role = await this.roleService.removePermission(id, permissionId);
    return {
      message: 'Permission removed successfully',
      role,
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle role active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role status updated successfully' })
  @Auth('admin', 'super-admin')
  async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.roleService.toggleStatus(id);
    return {
      message: 'Role status updated successfully',
      role,
    };
  }
}
