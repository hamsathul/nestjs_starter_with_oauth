import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserProvider } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { RegisterDto, LoginDto } from '../../dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; token: string }> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default user role
    let userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    // Create default role if it doesn't exist
    if (!userRole) {
      userRole = this.roleRepository.create({
        name: 'user',
        description: 'Default user role',
      });
      await this.roleRepository.save(userRole);
    }

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      provider: UserProvider.LOCAL,
      roles: [userRole],
    });

    await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  async validateOAuthUser(profile: any): Promise<User> {
    const { email, firstName, lastName, avatar, provider, providerId } = profile;

    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (user) {
      // Update user with OAuth data if needed
      if (!user.providerId && provider) {
        user.provider = provider;
        user.providerId = providerId;
        user.avatar = avatar || user.avatar;
        await this.userRepository.save(user);
      }
      return user;
    }

    // Create new user from OAuth profile
    let userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    if (!userRole) {
      userRole = this.roleRepository.create({
        name: 'user',
        description: 'Default user role',
      });
      await this.roleRepository.save(userRole);
    }

    user = this.userRepository.create({
      email,
      firstName,
      lastName,
      avatar,
      provider,
      providerId,
      isEmailVerified: true, // OAuth emails are typically verified
      roles: [userRole],
    });

    await this.userRepository.save(user);
    return user;
  }

  generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email,
      roles: user.roles?.map(role => role.name) || [],
    };
    return this.jwtService.sign(payload);
  }

  async refreshToken(user: User): Promise<string> {
    return this.generateToken(user);
  }
}
