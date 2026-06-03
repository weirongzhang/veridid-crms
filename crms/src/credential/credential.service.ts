import { Injectable, Logger } from '@nestjs/common';
import { DidCommAutoAcceptCredential } from '@credo-ts/didcomm';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);

  constructor(private readonly agentService: AgentService) {}

  async getAll(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.credentials.getAll();
  }

  async getById(tenantId: string, credentialId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.didcomm.credentials.findById(credentialId);
  }

  async issueCredential(
    tenantId: string,
    connectionId: string,
    credentialDefinitionId: string,
    attributes: Record<string, string>,
  ) {
    const agent = await this.agentService.getAgent(tenantId);

    const credDefResult = await agent.modules.anoncreds.getCredentialDefinition(credentialDefinitionId);
    const credDef = credDefResult.credentialDefinition;
    if (!credDef) {
      throw new Error(`Credential definition ${credentialDefinitionId} not found`);
    }

    const schemaResult = await agent.modules.anoncreds.getSchema(credDef.schemaId);
    const schema = schemaResult.schema;
    if (!schema) {
      throw new Error(`Schema ${credDef.schemaId} not found`);
    }

    const credentialAttributes = schema.attrNames.map((name: string) => ({
      name,
      value: attributes[name] ?? '',
    }));

    this.logger.log(`Issuing credential to connection ${connectionId} with definition ${credentialDefinitionId}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (agent.didcomm.credentials as any).offerCredential({
      connectionId,
      protocolVersion: 'v2',
      credentialFormats: {
        anoncreds: {
          credentialDefinitionId,
          attributes: credentialAttributes,
        },
      },
      autoAcceptCredential: DidCommAutoAcceptCredential.Always,
    });
  }
}
