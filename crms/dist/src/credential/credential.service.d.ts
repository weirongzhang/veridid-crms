import { AgentService } from '../agent/agent.service';
export declare class CredentialService {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    getAll(tenantId: string): Promise<any>;
    getById(tenantId: string, credentialId: string): Promise<any>;
    issueCredential(tenantId: string, connectionId: string, credentialDefinitionId: string, attributes: Record<string, string>): Promise<any>;
}
