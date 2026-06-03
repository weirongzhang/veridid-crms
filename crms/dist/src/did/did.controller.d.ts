import type { JwtPayload } from '../auth/jwt-auth.guard';
import { DidService } from './did.service';
import { CreateDidDto, ImportSeedDidDto } from './did.dto';
export declare class DidController {
    private readonly didService;
    private readonly logger;
    constructor(didService: DidService);
    getAll(user: JwtPayload): Promise<{
        success: boolean;
        dids: {
            did: any;
            method: any;
            createdAt: any;
        }[];
    }>;
    resolve(user: JwtPayload, did: string): Promise<{
        success: boolean;
        didDocument: import("@credo-ts/core", { with: { "resolution-mode": "import" } }).DidDocument | null;
        didResolutionMetadata: import("@credo-ts/core", { with: { "resolution-mode": "import" } }).DidResolutionMetadata;
    }>;
    importFromSeed(user: JwtPayload, body: ImportSeedDidDto): Promise<{
        success: boolean;
        message: string;
        did: string;
    }>;
    create(user: JwtPayload, body: CreateDidDto): Promise<{
        success: boolean;
        message: string;
        did: {
            did: string;
            method: "key" | "peer" | "indy";
            didDocument: any;
            createdAt: string;
        };
    }>;
}
