import { AgentService } from '../agent/agent.service';
export type SupportedDidMethod = 'indy' | 'key' | 'peer';
export declare class DidService {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    getAll(tenantId: string): Promise<{
        did: any;
        method: any;
        createdAt: any;
    }[]>;
    resolve(tenantId: string, did: string): Promise<import("@credo-ts/core", { with: { "resolution-mode": "import" } }).DidResolutionResult>;
    create(tenantId: string, method: SupportedDidMethod, keyType?: string): Promise<import("@credo-ts/core", { with: { "resolution-mode": "import" } }).DidOperationStateFinished>;
    importFromSeed(tenantId: string, seed: string, verkey: string, shortDid: string, indyNamespace?: string): Promise<{
        did: string;
    }>;
}
