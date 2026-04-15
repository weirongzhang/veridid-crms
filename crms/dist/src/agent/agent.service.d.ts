import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Agent } from '@credo-ts/core';
export declare class AgentService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private agent;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getConnections(): Promise<import("@credo-ts/core").ConnectionRecord[]>;
    createOobInvitationUrl(): Promise<string>;
    getAgent(): Agent;
    test(): string;
}
