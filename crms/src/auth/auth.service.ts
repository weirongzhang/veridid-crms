import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../user/user.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { AgentService } from '../agent/agent.service';
import { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: EntityRepository<PasswordResetToken>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly agentService: AgentService,
  ) {}

  private get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'jwt-secret');
  }

  private get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', 'jwt-refresh-secret');
  }

  private signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '15m',
    });
  }

  private signRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.jwtRefreshSecret,
      expiresIn: '7d',
    });
  }

  private buildTokenPair(user: User): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId ?? '',
    };
    return {
      accessToken: this.signAccessToken(payload),
      refreshToken: this.signRefreshToken(payload),
    };
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const existing = await this.userRepo.findOne({ email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const { tenantId } = await this.agentService.createTenant(email);
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.em.create(User, {
      email,
      passwordHash,
      firstName,
      lastName,
      tenantId,
    } as any);
    await this.em.persistAndFlush(user);

    this.logger.log(`Registered user ${email} with tenant ${tenantId}`);
    return { user, ...this.buildTokenPair(user) };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.em.flush();

    this.logger.log(`User ${email} logged in`);
    return { user, ...this.buildTokenPair(user) };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, { secret: this.jwtSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findOne({ id: payload.sub });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.buildTokenPair(user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ email });
    if (!user) return; // anti-enumeration: silent success

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const resetToken = this.em.create(PasswordResetToken, { token, user, expiresAt } as any);
    await this.em.persistAndFlush(resetToken);

    // Log the reset link; replace with email service as needed
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
    this.logger.log(`Password reset link: ${frontendUrl}/reset-password?token=${token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.resetTokenRepo.findOne(
      { token, usedAt: null },
      { populate: ['user'] },
    );

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    resetToken.user.passwordHash = passwordHash;
    resetToken.usedAt = new Date();
    await this.em.flush();
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    const resetToken = await this.resetTokenRepo.findOne({ token, usedAt: null });
    const valid = !!resetToken && resetToken.expiresAt >= new Date();
    return { valid };
  }
}
