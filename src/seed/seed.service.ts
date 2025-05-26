import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserProvider } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedUsers();
    this.logger.log('Database seeding completed!');
  }

  private async seedPermissions() {
    const permissions = [
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

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        this.logger.log(`Created permission: ${permissionData.name}`);
      }
    }
  }

  private async seedRoles() {
    // Get all permissions
    const allPermissions = await this.permissionRepository.find();
    const userPermissions = allPermissions.filter(p => p.resource === 'user' && p.action === 'read');
    const adminPermissions = allPermissions.filter(p => !p.name.includes('permission:') || p.action === 'read');
    
    const roles = [
      {
        name: 'user',
        description: 'Default user role',
        permissions: userPermissions,
      },
      {
        name: 'admin',
        description: 'Administrator role with elevated permissions',
        permissions: adminPermissions,
      },
      {
        name: 'super-admin',
        description: 'Super administrator with full access',
        permissions: allPermissions,
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        await this.roleRepository.save(role);
        this.logger.log(`Created role: ${roleData.name}`);
      }
    }
  }

  private async seedUsers() {
    // Get roles
    const userRole = await this.roleRepository.findOne({ where: { name: 'user' } });
    const adminRole = await this.roleRepository.findOne({ where: { name: 'admin' } });
    const superAdminRole = await this.roleRepository.findOne({ where: { name: 'super-admin' } });

    const users = [
      {
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Regular',
        lastName: 'User',
        provider: UserProvider.LOCAL,
        isEmailVerified: true,
        roles: [userRole],
      },
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        provider: UserProvider.LOCAL,
        isEmailVerified: true,
        roles: [adminRole],
      },
      {
        email: 'superadmin@example.com',
        password: await bcrypt.hash('superadmin123', 10),
        firstName: 'Super',
        lastName: 'Admin',
        provider: UserProvider.LOCAL,
        isEmailVerified: true,
        roles: [superAdminRole],
      },
    ];

    for (const userData of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });      if (!existingUser) {
        const { roles, ...userDataWithoutRoles } = userData;
        const user = this.userRepository.create(userDataWithoutRoles);
        user.roles = roles.filter(role => role !== null) as Role[];
        await this.userRepository.save(user);
        this.logger.log(`Created user: ${userData.email}`);
      }
    }
  }
}
