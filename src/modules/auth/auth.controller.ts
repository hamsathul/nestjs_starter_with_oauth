import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from '../../dto';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../../guards/google-auth.guard';
import { LinkedInAuthGuard } from '../../guards/linkedin-auth.guard';
import { GetUser } from '../../decorators/get-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  async login(@GetUser() user: User) {
    const token = this.authService.generateToken(user);
    return {
      message: 'Login successful',
      user,
      token,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: User) {
    return {
      message: 'Profile retrieved successfully',
      user,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @UseGuards(JwtAuthGuard)
  async refreshToken(@GetUser() user: User) {
    const token = await this.authService.refreshToken(user);
    return {
      message: 'Token refreshed successfully',
      token,
    };
  }

  // Google OAuth
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const token = this.authService.generateToken(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // LinkedIn OAuth
  @Get('linkedin')
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth login' })
  @UseGuards(LinkedInAuthGuard)
  async linkedinAuth() {
    // Guard redirects to LinkedIn
  }

  @Get('linkedin/callback')
  @ApiOperation({ summary: 'LinkedIn OAuth callback' })
  @UseGuards(LinkedInAuthGuard)
  async linkedinAuthCallback(@Req() req, @Res() res: Response) {
    const token = this.authService.generateToken(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @UseGuards(JwtAuthGuard)
  logout() {
    return {
      message: 'Logout successful',
    };
  }
}
