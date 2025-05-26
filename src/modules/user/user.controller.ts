import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User, UserStatus } from '../../entities/user.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { GetUser } from '../../decorators/get-user.decorator';
import { Auth } from '../../decorators/auth.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @Auth('admin', 'super-admin')
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.userService.findAll(page, limit);
    return {
      message: 'Users retrieved successfully',
      ...result,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: User) {
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  @Auth('admin', 'super-admin')
  async getUserStats() {
    const stats = await this.userService.getUserStats();
    return {
      message: 'User statistics retrieved successfully',
      stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Auth('admin', 'super-admin')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findById(id);
    return {
      message: 'User retrieved successfully',
      user,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Remove sensitive fields that users shouldn't be able to update themselves
    const { status, roleIds, ...safeUpdateData } = updateUserDto;
    
    const updatedUser = await this.userService.update(user.id, safeUpdateData);
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Auth('admin', 'super-admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      message: 'User updated successfully',
      user,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Auth('super-admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }

  @Post(':id/roles/:roleId')
  @ApiOperation({ summary: 'Assign role to user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @Auth('admin', 'super-admin')
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const user = await this.userService.assignRole(id, roleId);
    return {
      message: 'Role assigned successfully',
      user,
    };
  }

  @Delete(':id/roles/:roleId')
  @ApiOperation({ summary: 'Remove role from user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @Auth('admin', 'super-admin')
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    const user = await this.userService.removeRole(id, roleId);
    return {
      message: 'Role removed successfully',
      user,
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change user status (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @Auth('admin', 'super-admin')
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: UserStatus,
  ) {
    const user = await this.userService.changeStatus(id, status);
    return {
      message: 'User status updated successfully',
      user,
    };
  }
}
