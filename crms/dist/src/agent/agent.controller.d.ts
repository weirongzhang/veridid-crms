import { AgentService } from './agent.service';
export declare class AgentController {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    test(): string;
    getConnections(): Promise<any>;
    createInvitation(): Promise<string>;
    initialize(body: {
        tenantId: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
    } | {
        success: boolean;
        message: any;
        tenantId?: undefined;
    }>;
    validate(body: {
        tenantId: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    createTenant(body: {
        label: string;
    }): Promise<{
        success: boolean;
        message: string;
        tenantId: string;
    } | {
        success: boolean;
        message: any;
        tenantId?: undefined;
    }>;
}
