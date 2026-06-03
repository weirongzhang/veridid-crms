import { User } from '../user/user.entity';
export declare class PasswordResetToken {
    id: string;
    token: string;
    user: User;
    expiresAt: Date;
    usedAt?: Date;
    createdAt: Date;
}
