import { AgentService } from '../agent/agent.service';
export declare class ProofService {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    getAll(tenantId: string): Promise<any>;
    getById(tenantId: string, proofId: string): Promise<any>;
    requestProof(tenantId: string, connectionId: string, proofAttributes: any, credentialDefinitionId?: string): Promise<any>;
    acceptProof(tenantId: string, proofId: string, selectedCredentials: any): Promise<any>;
}
