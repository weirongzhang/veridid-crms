import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class CredentialDefinitionService {
  private readonly logger = new Logger(CredentialDefinitionService.name);

  constructor(private readonly agentService: AgentService) {}

  async getAll(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.modules.anoncreds.getCreatedCredentialDefinitions({});
  }

  async getById(tenantId: string, credDefId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    const credDefs = await agent.modules.anoncreds.getCreatedCredentialDefinitions({
      credentialDefinitionId: credDefId,
    });
    const credDef = credDefs[0];
    if (!credDef) {
      throw new NotFoundException(`Credential definition ${credDefId} not found`);
    }
    return credDef;
  }

  async register(
    tenantId: string,
    schemaId: string,
    tag: string,
    supportRevocation?: boolean,
  ) {
    const agent = await this.agentService.getAgent(tenantId);

    // Resolve the schema to get the issuer DID
    const schemaResult = await agent.modules.anoncreds.getSchema(schemaId);
    if (!schemaResult.schema) {
      throw new NotFoundException(`Schema ${schemaId} not found`);
    }
    const issuerId = schemaResult.schema.issuerId;

    this.logger.log(`Registering credential definition tag="${tag}" schema="${schemaId}" issuer="${issuerId}"`);

    const result = await agent.modules.anoncreds.registerCredentialDefinition({
      credentialDefinition: {
        issuerId,
        schemaId,
        tag,
        type: 'CL',
      },
      options: {},
    });

    if (result.credentialDefinitionState.state !== 'finished') {
      throw new Error(
        `Credential definition registration failed: ${result.credentialDefinitionState.reason ?? result.credentialDefinitionState.state}`,
      );
    }

    return result;
  }
}
