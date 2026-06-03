import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { JwtPayload } from './jwt-auth.guard';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    private setRefreshCookie;
    register(body: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }, res: Response): Promise<{
        success: boolean;
        message: string;
        accessToken: string;
        user: {
            id: string;
            email: string;
            tenantId: string | undefined;
            role: import("../user/user.entity").UserRole;
        };
    }>;
    login(body: {
        email: string;
        password: string;
    }, res: Response): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            id: string;
            email: string;
            tenantId: string | undefined;
            role: import("../user/user.entity").UserRole;
        };
    }>;
    verify(user: JwtPayload): Promise<{
        success: boolean;
        user: JwtPayload;
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        accessToken: string;
    }>;
    logout(res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    validateResetToken(body: {
        token: string;
    }): Promise<{
        valid: boolean;
    }>;
}
