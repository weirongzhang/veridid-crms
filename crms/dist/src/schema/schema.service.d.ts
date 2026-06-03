import { AgentService } from '../agent/agent.service';
export declare class SchemaService {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    getAll(tenantId: string): Promise<any>;
    getBySchemaId(tenantId: string, schemaId: string): Promise<any>;
    getAvailableDids(tenantId: string): Promise<{
        dids: {
            did: any;
            type: any;
            createdAt: any;
        }[];
        didsByType: Record<string, {
            did: string;
            createdAt: Date;
        }[]>;
    }>;
    registerSchema(tenantId: string, name: string, version: string, attrNames: string[], issuerId: string): Promise<any>;
}
