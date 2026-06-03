import type { JwtPayload } from '../auth/jwt-auth.guard';
import { ConnectionService } from './connection.service';
export declare class ConnectionController {
    private readonly connectionService;
    private readonly logger;
    constructor(connectionService: ConnectionService);
    getAll(user: JwtPayload): Promise<{
        invitations: any;
        connections: any;
        success: boolean;
    }>;
    getMessages(user: JwtPayload, connectionId: string): Promise<{
        success: boolean;
        messages: any;
    }>;
    getById(user: JwtPayload, connectionId: string): Promise<{
        success: boolean;
        connection: {
            id: any;
            createdAt: any;
            state: any;
            role: any;
            theirLabel: any;
            theirDid: any;
            threadId: any;
            autoAcceptConnection: any;
        };
    }>;
    createInvitation(user: JwtPayload, body: {
        label?: string;
    }): Promise<{
        success: boolean;
        invitation: {
            id: any;
            url: any;
            outOfBandInvitation: any;
        };
    }>;
    receiveInvitation(user: JwtPayload, body: {
        invitationUrl: string;
    }): Promise<{
        success: boolean;
        message: string;
        connection?: undefined;
    } | {
        success: boolean;
        connection: {
            id: any;
            state: any;
            role: any;
            theirLabel: any;
            createdAt: any;
        };
        message?: undefined;
    }>;
    sendMessage(user: JwtPayload, body: {
        connectionId: string;
        message: string;
    }): Promise<{
        success: boolean;
        message: any;
    }>;
}
