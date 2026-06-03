import { AgentService } from '../agent/agent.service';
export declare class CredentialDefinitionService {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    getAll(tenantId: string): Promise<any>;
    getById(tenantId: string, credDefId: string): Promise<any>;
    register(tenantId: string, schemaId: string, tag: string, supportRevocation?: boolean): Promise<any>;
}
