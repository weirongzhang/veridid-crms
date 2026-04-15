import { AgentService } from './agent.service';
export declare class AgentController {
    private readonly agentService;
    private readonly logger;
    constructor(agentService: AgentService);
    test(): string;
    getConnections(): Promise<import("@credo-ts/core").ConnectionRecord[]>;
    createInvitation(): Promise<string>;
}
