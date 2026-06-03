import { AgentService } from '../agent/agent.service';
export declare class ConnectionService {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    getAll(tenantId: string): Promise<{
        invitations: any;
        connections: any;
    }>;
    getById(tenantId: string, connectionId: string): Promise<any>;
    createInvitation(tenantId: string, label?: string): Promise<{
        id: any;
        url: any;
        outOfBandInvitation: any;
    }>;
    receiveInvitation(tenantId: string, invitationUrl: string): Promise<any>;
    sendMessage(tenantId: string, connectionId: string, message: string): Promise<any>;
    getMessages(tenantId: string, connectionId: string): Promise<any>;
}
