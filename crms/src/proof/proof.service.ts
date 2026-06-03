import { Injectable, Logger } from '@nestjs/common';
import { DidCommAutoAcceptProof } from '@credo-ts/didcomm';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class ProofService {
  private readonly logger = new Logger(ProofService.name);

  constructor(private readonly agentService: AgentService) {}

  async getAll(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.proofs.getAll();
  }

  async getById(tenantId: string, proofId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.proofs.findById(proofId);
  }

  async requestProof(
    tenantId: string,
    connectionId: string,
    proofAttributes: any,
    credentialDefinitionId?: string,
  ) {
    const agent = await this.agentService.getAgent(tenantId);

    const requestedAttributes: Record<string, any> = {};

    if (Array.isArray(proofAttributes)) {
      proofAttributes.forEach((attr: any) => {
        requestedAttributes[attr.name] = {
          name: attr.name,
          restrictions: credentialDefinitionId
            ? [{ cred_def_id: credentialDefinitionId }]
            : (attr.restrictions || []),
        };
      });
    } else if (typeof proofAttributes === 'object') {
      Object.assign(requestedAttributes, proofAttributes);
    }

    this.logger.log(`Requesting proof from connection ${connectionId}`);

    return agent.didcomm.proofs.requestProof({
      connectionId,
      protocolVersion: 'v2',
      proofFormats: {
        anoncreds: {
          name: 'Proof Request',
          version: '1.0',
          requested_attributes: requestedAttributes,
        },
      },
      autoAcceptProof: DidCommAutoAcceptProof.Always,
    });
  }

  async acceptProof(tenantId: string, proofId: string, selectedCredentials: any) {
    const agent = await this.agentService.getAgent(tenantId);

    const proofRecord = await agent.didcomm.proofs.findById(proofId);
    if (!proofRecord) {
      throw new Error(`Proof record ${proofId} not found`);
    }

    let requestedCredentials: any;
    try {
      requestedCredentials = await agent.didcomm.proofs.selectCredentialsForRequest({
        proofExchangeRecordId: proofRecord.id,
      });
    } catch {
      requestedCredentials = {
        proofFormats: { anoncreds: { requested_attributes: selectedCredentials } },
      };
    }

    await agent.didcomm.proofs.acceptRequest({
      proofExchangeRecordId: proofId,
      proofFormats: requestedCredentials.proofFormats,
    });

    return agent.didcomm.proofs.findById(proofId);
  }
}
