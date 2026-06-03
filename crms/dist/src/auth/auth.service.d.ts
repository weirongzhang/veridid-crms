import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { User } from '../user/user.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { AgentService } from '../agent/agent.service';
import { JwtPayload } from './jwt-auth.guard';
export declare class AuthService {
    private readonly userRepo;
    private readonly resetTokenRepo;
    private readonly em;
    private readonly jwtService;
    private readonly configService;
    private readonly agentService;
    private readonly logger;
    constructor(userRepo: EntityRepository<User>, resetTokenRepo: EntityRepository<PasswordResetToken>, em: EntityManager, jwtService: JwtService, configService: ConfigService, agentService: AgentService);
    private get jwtSecret();
    private get jwtRefreshSecret();
    private signAccessToken;
    private signRefreshToken;
    private buildTokenPair;
    register(email: string, password: string, firstName?: string, lastName?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: User;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: import("@mikro-orm/core").Loaded<User, never, "*", never>;
    }>;
    verifyAccessToken(token: string): JwtPayload;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    validateResetToken(token: string): Promise<{
        valid: boolean;
    }>;
}
