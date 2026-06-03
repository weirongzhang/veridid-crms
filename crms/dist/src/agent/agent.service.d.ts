import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent } from '@credo-ts/core';
export declare class AgentService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private mainAgent;
    private agentEndpoint;
    private readonly tenantAgentCache;
    private readonly MAX_RETRIES;
    private readonly RETRY_DELAY_MS;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private initializeMainAgent;
    private withRetry;
    getAgent(tenantId: string): Promise<Agent<any>>;
    createTenant(label: string): Promise<{
        tenantId: string;
    }>;
    validateCredentials(tenantId: string): Promise<boolean>;
    getMainAgent(): Agent;
    getConnections(): Promise<any>;
    createOobInvitationUrl(): Promise<string>;
    test(): string;
}
