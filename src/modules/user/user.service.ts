import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UpdateUserDto } from '../../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<{ users: User[]; total: number; pages: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['roles', 'roles.permissions'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    const { roleIds, ...updateData } = updateUserDto;

    // Update basic user data
    Object.assign(user, updateData);

    // Update roles if provided
    if (roleIds && roleIds.length > 0) {
      const roles = await this.roleRepository.findByIds(roleIds);
      if (roles.length !== roleIds.length) {
        throw new NotFoundException('One or more roles not found');
      }
      user.roles = roles;
    }

    return await this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    const user = await this.findById(userId);
    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if user already has this role
    const hasRole = user.roles.some(userRole => userRole.id === roleId);
    if (hasRole) {
      throw new ConflictException('User already has this role');
    }

    user.roles.push(role);
    return await this.userRepository.save(user);
  }

  async removeRole(userId: string, roleId: string): Promise<User> {
    const user = await this.findById(userId);
    
    user.roles = user.roles.filter(role => role.id !== roleId);
    return await this.userRepository.save(user);
  }

  async changeStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id);
    user.status = status;
    return await this.userRepository.save(user);
  }

  async getUserStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const inactiveUsers = await this.userRepository.count({ where: { status: UserStatus.INACTIVE } });
    const bannedUsers = await this.userRepository.count({ where: { status: UserStatus.BANNED } });

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      banned: bannedUsers,
    };
  }
}
