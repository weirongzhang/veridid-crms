import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentService } from '../agent/agent.service';

@Injectable()
export class SchemaService {
  private readonly logger = new Logger(SchemaService.name);

  constructor(private readonly agentService: AgentService) {}

  async getAll(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.modules.anoncreds.getCreatedSchemas({});
  }

  async getBySchemaId(tenantId: string, schemaId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    const result = await agent.modules.anoncreds.getSchema(schemaId);
    if (!result.schema) {
      throw new NotFoundException(`Schema ${schemaId} not found`);
    }
    return result;
  }

  async getAvailableDids(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    const dids = await agent.dids.getCreatedDids({});

    const didsByType: Record<string, { did: string; createdAt: Date }[]> = {};
    dids.forEach((d: any) => {
      const type = d.did.split(':')[1] ?? 'unknown';
      if (!didsByType[type]) didsByType[type] = [];
      didsByType[type].push({ did: d.did, createdAt: d.createdAt });
    });

    return {
      dids: dids.map((d: any) => ({ did: d.did, type: d.did.split(':')[1], createdAt: d.createdAt })),
      didsByType,
    };
  }

  async registerSchema(
    tenantId: string,
    name: string,
    version: string,
    attrNames: string[],
    issuerId: string,
  ) {
    const agent = await this.agentService.getAgent(tenantId);

    // Verify the issuer DID exists in this tenant's wallet
    const dids = await agent.dids.getCreatedDids({});
    const issuerDid = dids.find((d: any) => d.did === issuerId);
    if (!issuerDid) {
      const available = dids.map((d: any) => d.did);
      throw new BadRequestException(
        `Issuer DID "${issuerId}" not found in this tenant's wallet. Available: ${available.join(', ')}`,
      );
    }

    this.logger.log(`Registering schema: ${name} v${version} for issuer ${issuerId}`);

    const result = await agent.modules.anoncreds.registerSchema({
      schema: { attrNames, issuerId, name, version },
      options: {},
    });

    if (result.schemaState.state !== 'finished') {
      throw new Error(
        `Schema registration failed: ${result.schemaState.reason ?? result.schemaState.state}`,
      );
    }

    return result;
  }
}
