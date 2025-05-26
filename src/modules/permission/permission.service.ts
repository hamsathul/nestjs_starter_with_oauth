import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { CreatePermissionDto } from '../../dto/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { name, description, resource, action } = createPermissionDto;

    // Check if permission already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });

    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = this.permissionRepository.create({
      name,
      description,
      resource,
      action,
    });

    return await this.permissionRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { resource },
      order: { action: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<CreatePermissionDto>): Promise<Permission> {
    const permission = await this.findById(id);

    // Check for name conflicts if name is being updated
    if (updateData.name && updateData.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updateData.name },
      });

      if (existingPermission) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    Object.assign(permission, updateData);
    return await this.permissionRepository.save(permission);
  }

  async delete(id: string): Promise<void> {
    const permission = await this.findById(id);

    // Check if permission is assigned to any roles
    if (permission.roles && permission.roles.length > 0) {
      throw new ConflictException('Cannot delete permission that is assigned to roles');
    }

    await this.permissionRepository.remove(permission);
  }

  async toggleStatus(id: string): Promise<Permission> {
    const permission = await this.findById(id);
    permission.isActive = !permission.isActive;
    return await this.permissionRepository.save(permission);
  }

  async seedDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // User permissions
      { name: 'user:create', description: 'Create users', resource: 'user', action: 'create' },
      { name: 'user:read', description: 'Read users', resource: 'user', action: 'read' },
      { name: 'user:update', description: 'Update users', resource: 'user', action: 'update' },
      { name: 'user:delete', description: 'Delete users', resource: 'user', action: 'delete' },
      
      // Role permissions
      { name: 'role:create', description: 'Create roles', resource: 'role', action: 'create' },
      { name: 'role:read', description: 'Read roles', resource: 'role', action: 'read' },
      { name: 'role:update', description: 'Update roles', resource: 'role', action: 'update' },
      { name: 'role:delete', description: 'Delete roles', resource: 'role', action: 'delete' },
      
      // Permission permissions
      { name: 'permission:create', description: 'Create permissions', resource: 'permission', action: 'create' },
      { name: 'permission:read', description: 'Read permissions', resource: 'permission', action: 'read' },
      { name: 'permission:update', description: 'Update permissions', resource: 'permission', action: 'update' },
      { name: 'permission:delete', description: 'Delete permissions', resource: 'permission', action: 'delete' },
      
      // Admin permissions
      { name: 'admin:access', description: 'Access admin panel', resource: 'admin', action: 'access' },
      { name: 'admin:manage', description: 'Full admin management', resource: 'admin', action: 'manage' },
    ];

    for (const permissionData of defaultPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
      }
    }
  }
}
