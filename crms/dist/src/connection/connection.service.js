"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ConnectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent/agent.service");
let ConnectionService = ConnectionService_1 = class ConnectionService {
    agentService;
    logger = new common_1.Logger(ConnectionService_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getAll(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        const [invitations, connections] = await Promise.all([
            agent.didcomm.oob.getAll(),
            agent.didcomm.connections.getAll(),
        ]);
        const filteredInvitations = invitations.filter((inv) => inv.state !== 'done');
        const endpoint = agent.didcomm?.config?.endpoints?.[0] ?? '';
        return {
            invitations: filteredInvitations.map((inv) => ({
                id: inv.id,
                createdAt: inv.createdAt,
                state: inv.state,
                role: inv.role,
                invitationId: inv.outOfBandInvitation['@id'],
                label: inv.outOfBandInvitation.label,
                url: inv.outOfBandInvitation.toUrl
                    ? inv.outOfBandInvitation.toUrl({ domain: endpoint })
                    : null,
            })),
            connections: connections.map((conn) => ({
                id: conn.id,
                createdAt: conn.createdAt,
                state: conn.state,
                role: conn.role,
                theirLabel: conn.theirLabel,
                theirDid: conn.theirDid,
            })),
        };
    }
    async getById(tenantId, connectionId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.connections.findById(connectionId);
    }
    async createInvitation(tenantId, label) {
        const agent = await this.agentService.getAgent(tenantId);
        const { outOfBandInvitation } = await agent.didcomm.oob.createInvitation({
            multiUseInvitation: true,
            ...(label ? { label } : {}),
        });
        const endpoint = agent.didcomm?.config?.endpoints?.[0] ?? '';
        const url = outOfBandInvitation.toUrl({ domain: endpoint });
        return { id: outOfBandInvitation.id, url, outOfBandInvitation };
    }
    async receiveInvitation(tenantId, invitationUrl) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.oob.receiveInvitationFromUrl(invitationUrl);
    }
    async sendMessage(tenantId, connectionId, message) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.basicMessages.sendMessage(connectionId, message);
    }
    async getMessages(tenantId, connectionId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.basicMessages.findAllByQuery({ connectionId });
    }
};
exports.ConnectionService = ConnectionService;
exports.ConnectionService = ConnectionService = ConnectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], ConnectionService);
//# sourceMappingURL=connection.service.js.map