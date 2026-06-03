"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const public_decorator_1 = require("./public.decorator");
const current_user_decorator_1 = require("./current-user.decorator");
const REFRESH_COOKIE = 'refreshToken';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
let AuthController = AuthController_1 = class AuthController {
    authService;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    setRefreshCookie(res, token) {
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: COOKIE_MAX_AGE_MS,
        });
    }
    async register(body, res) {
        this.logger.log(`POST /auth/register - ${body.email}`);
        const { user, accessToken, refreshToken } = await this.authService.register(body.email, body.password, body.firstName, body.lastName);
        this.setRefreshCookie(res, refreshToken);
        return {
            success: true,
            message: 'Registration successful',
            accessToken,
            user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role },
        };
    }
    async login(body, res) {
        this.logger.log(`POST /auth/login - ${body.email}`);
        const { user, accessToken, refreshToken } = await this.authService.login(body.email, body.password);
        this.setRefreshCookie(res, refreshToken);
        return {
            success: true,
            accessToken,
            user: { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role },
        };
    }
    async verify(user) {
        return { success: true, user };
    }
    async refresh(req, res) {
        const token = req.cookies?.[REFRESH_COOKIE];
        if (!token) {
            throw new common_1.UnauthorizedException('No refresh token');
        }
        const { accessToken, refreshToken } = await this.authService.refresh(token);
        this.setRefreshCookie(res, refreshToken);
        return { success: true, accessToken };
    }
    async logout(res) {
        res.clearCookie(REFRESH_COOKIE, { path: '/' });
        return { success: true, message: 'Logged out' };
    }
    async forgotPassword(body) {
        this.logger.log(`POST /auth/forgot-password - ${body.email}`);
        await this.authService.forgotPassword(body.email);
        return { success: true, message: 'If that email exists, a reset link has been sent' };
    }
    async resetPassword(body) {
        await this.authService.resetPassword(body.token, body.newPassword);
        return { success: true, message: 'Password reset successfully' };
    }
    async validateResetToken(body) {
        return this.authService.validateResetToken(body.token);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user and create a Credo tenant' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: {
                email: { type: 'string' },
                password: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
            },
            required: ['email', 'password'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: { email: { type: 'string' }, password: { type: 'string' } },
            required: ['email', 'password'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Verify the current access token' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rotate access and refresh tokens using the refresh cookie' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Clear the refresh token cookie' }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request a password reset email' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { email: { type: 'string' } }, required: ['email'] } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password using a valid reset token' }),
    (0, swagger_1.ApiBody)({
        schema: {
            properties: { token: { type: 'string' }, newPassword: { type: 'string' } },
            required: ['token', 'newPassword'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('validate-reset-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Check whether a password reset token is still valid' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { token: { type: 'string' } }, required: ['token'] } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateResetToken", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map