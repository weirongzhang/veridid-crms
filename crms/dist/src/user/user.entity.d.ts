export declare enum UserRole {
    Admin = "admin",
    User = "user"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
