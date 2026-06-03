import type { JwtPayload } from '../auth/jwt-auth.guard';
import { ProofService } from './proof.service';
export declare class ProofController {
    private readonly proofService;
    private readonly logger;
    constructor(proofService: ProofService);
    getAll(user: JwtPayload): Promise<{
        success: boolean;
        proofs: any;
    }>;
    requestProof(user: JwtPayload, body: {
        connectionId: string;
        proofAttributes: any;
        credentialDefinitionId?: string;
    }): Promise<{
        success: boolean;
        proof: {
            id: any;
            state: any;
            connectionId: any;
            threadId: any;
        };
    }>;
    acceptProof(user: JwtPayload, proofId: string, body: {
        selectedCredentials: any;
    }): Promise<{
        success: boolean;
        proof: {
            id: any;
            state: any;
            connectionId: any;
            threadId: any;
            isVerified: any;
        };
    }>;
    getById(user: JwtPayload, proofId: string): Promise<{
        success: boolean;
        proof: {
            id: any;
            state: any;
            createdAt: any;
            connectionId: any;
            threadId: any;
            isVerified: any;
        };
    }>;
}
