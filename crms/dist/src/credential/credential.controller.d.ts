import type { JwtPayload } from '../auth/jwt-auth.guard';
import { CredentialService } from './credential.service';
export declare class CredentialController {
    private readonly credentialService;
    private readonly logger;
    constructor(credentialService: CredentialService);
    getAll(user: JwtPayload): Promise<{
        success: boolean;
        credentials: any;
    }>;
    issue(user: JwtPayload, body: {
        connectionId: string;
        credentialDefinitionId: string;
        attributes: Record<string, string>;
    }): Promise<{
        success: boolean;
        credential: {
            id: any;
            state: any;
            connectionId: any;
            threadId: any;
            credentialDefinitionId: string;
        };
    }>;
    getById(user: JwtPayload, credentialId: string): Promise<{
        success: boolean;
        credential: {
            id: any;
            state: any;
            createdAt: any;
            connectionId: any;
            attributes: any;
        };
    }>;
}
