import { Injectable, Logger } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class ConnectionService {
  private readonly logger = new Logger(ConnectionService.name);

  constructor(private readonly agentService: AgentService) {}

  async getAll(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    const [invitations, connections] = await Promise.all([
      agent.didcomm.oob.getAll(),
      agent.didcomm.connections.getAll(),
    ]);

    const filteredInvitations = invitations.filter((inv: any) => inv.state !== 'done');
    const endpoint = (agent as any).didcomm?.config?.endpoints?.[0] ?? '';

    return {
      invitations: filteredInvitations.map((inv: any) => ({
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
      connections: connections.map((conn: any) => ({
        id: conn.id,
        createdAt: conn.createdAt,
        state: conn.state,
        role: conn.role,
        theirLabel: conn.theirLabel,
        theirDid: conn.theirDid,
      })),
    };
  }

  async getById(tenantId: string, connectionId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.connections.findById(connectionId);
  }

  async createInvitation(tenantId: string, label?: string) {
    const agent = await this.agentService.getAgent(tenantId);
    const { outOfBandInvitation } = await agent.didcomm.oob.createInvitation({
      multiUseInvitation: true,
      ...(label ? { label } : {}),
    });
    const endpoint = (agent as any).didcomm?.config?.endpoints?.[0] ?? '';
    const url = outOfBandInvitation.toUrl({ domain: endpoint });
    return { id: outOfBandInvitation.id, url, outOfBandInvitation };
  }

  async receiveInvitation(tenantId: string, invitationUrl: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.oob.receiveInvitationFromUrl(invitationUrl);
  }

  async sendMessage(tenantId: string, connectionId: string, message: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.basicMessages.sendMessage(connectionId, message);
  }

  async getMessages(tenantId: string, connectionId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.basicMessages.findAllByQuery({ connectionId });
  }
}
