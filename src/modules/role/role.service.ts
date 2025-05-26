import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { CreateRoleDto } from '../../dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Get permissions if provided
    let permissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.permissionRepository.findByIds(permissionIds);
      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException('One or more permissions not found');
      }
    }

    const role = this.roleRepository.create({
      name,
      description,
      permissions,
    });

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateData: Partial<CreateRoleDto>): Promise<Role> {
    const role = await this.findById(id);

    const { permissionIds, ...roleData } = updateData;

    // Check for name conflicts if name is being updated
    if (roleData.name && roleData.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Update basic role data
    Object.assign(role, roleData);

    // Update permissions if provided
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findByIds(permissionIds);
        if (permissions.length !== permissionIds.length) {
          throw new NotFoundException('One or more permissions not found');
        }
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return await this.roleRepository.save(role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findById(id);

    // Check if role has users assigned
    if (role.users && role.users.length > 0) {
      throw new ConflictException('Cannot delete role that has users assigned');
    }

    await this.roleRepository.remove(role);
  }

  async assignPermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findById(roleId);
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if role already has this permission
    const hasPermission = role.permissions.some(p => p.id === permissionId);
    if (hasPermission) {
      throw new ConflictException('Role already has this permission');
    }

    role.permissions.push(permission);
    return await this.roleRepository.save(role);
  }

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.findById(roleId);
    
    role.permissions = role.permissions.filter(permission => permission.id !== permissionId);
    return await this.roleRepository.save(role);
  }

  async toggleStatus(id: string): Promise<Role> {
    const role = await this.findById(id);
    role.isActive = !role.isActive;
    return await this.roleRepository.save(role);
  }
}
