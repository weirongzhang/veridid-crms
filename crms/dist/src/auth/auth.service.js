"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const nestjs_1 = require("@mikro-orm/nestjs");
const core_1 = require("@mikro-orm/core");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const user_entity_1 = require("../user/user.entity");
const password_reset_token_entity_1 = require("./password-reset-token.entity");
const agent_service_1 = require("../agent/agent.service");
let AuthService = AuthService_1 = class AuthService {
    userRepo;
    resetTokenRepo;
    em;
    jwtService;
    configService;
    agentService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(userRepo, resetTokenRepo, em, jwtService, configService, agentService) {
        this.userRepo = userRepo;
        this.resetTokenRepo = resetTokenRepo;
        this.em = em;
        this.jwtService = jwtService;
        this.configService = configService;
        this.agentService = agentService;
    }
    get jwtSecret() {
        return this.configService.get('JWT_SECRET', 'jwt-secret');
    }
    get jwtRefreshSecret() {
        return this.configService.get('JWT_REFRESH_SECRET', 'jwt-refresh-secret');
    }
    signAccessToken(payload) {
        return this.jwtService.sign(payload, {
            secret: this.jwtSecret,
            expiresIn: '15m',
        });
    }
    signRefreshToken(payload) {
        return this.jwtService.sign(payload, {
            secret: this.jwtRefreshSecret,
            expiresIn: '7d',
        });
    }
    buildTokenPair(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId ?? '',
        };
        return {
            accessToken: this.signAccessToken(payload),
            refreshToken: this.signRefreshToken(payload),
        };
    }
    async register(email, password, firstName, lastName) {
        const existing = await this.userRepo.findOne({ email });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const { tenantId } = await this.agentService.createTenant(email);
        const passwordHash = await bcrypt.hash(password, 10);
        const user = this.em.create(user_entity_1.User, {
            email,
            passwordHash,
            firstName,
            lastName,
            tenantId,
        });
        await this.em.persistAndFlush(user);
        this.logger.log(`Registered user ${email} with tenant ${tenantId}`);
        return { user, ...this.buildTokenPair(user) };
    }
    async login(email, password) {
        const user = await this.userRepo.findOne({ email });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        user.lastLoginAt = new Date();
        await this.em.flush();
        this.logger.log(`User ${email} logged in`);
        return { user, ...this.buildTokenPair(user) };
    }
    verifyAccessToken(token) {
        try {
            return this.jwtService.verify(token, { secret: this.jwtSecret });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.jwtRefreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.userRepo.findOne({ id: payload.sub });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.buildTokenPair(user);
    }
    async forgotPassword(email) {
        const user = await this.userRepo.findOne({ email });
        if (!user)
            return;
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        const resetToken = this.em.create(password_reset_token_entity_1.PasswordResetToken, { token, user, expiresAt });
        await this.em.persistAndFlush(resetToken);
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');
        this.logger.log(`Password reset link: ${frontendUrl}/reset-password?token=${token}`);
    }
    async resetPassword(token, newPassword) {
        const resetToken = await this.resetTokenRepo.findOne({ token, usedAt: null }, { populate: ['user'] });
        if (!resetToken || resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        resetToken.user.passwordHash = passwordHash;
        resetToken.usedAt = new Date();
        await this.em.flush();
    }
    async validateResetToken(token) {
        const resetToken = await this.resetTokenRepo.findOne({ token, usedAt: null });
        const valid = !!resetToken && resetToken.expiresAt >= new Date();
        return { valid };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, nestjs_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __metadata("design:paramtypes", [core_1.EntityRepository,
        core_1.EntityRepository,
        core_1.EntityManager,
        jwt_1.JwtService,
        config_1.ConfigService,
        agent_service_1.AgentService])
], AuthService);
//# sourceMappingURL=auth.service.js.map