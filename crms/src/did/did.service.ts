import { Injectable, Logger } from '@nestjs/common';
import { TypedArrayEncoder } from '@credo-ts/core';
import { AgentService } from '../agent/agent.service';

export type SupportedDidMethod = 'indy' | 'key' | 'peer';

@Injectable()
export class DidService {
  private readonly logger = new Logger(DidService.name);

  constructor(private readonly agentService: AgentService) {}

  async getAll(tenantId: string) {
    const agent = await this.agentService.getAgent(tenantId);
    const dids = await agent.dids.getCreatedDids({});
    return dids.map((d: any) => ({
      did: d.did,
      method: d.did.split(':')[1] ?? 'unknown',
      createdAt: d.createdAt,
    }));
  }

  async resolve(tenantId: string, did: string) {
    const agent = await this.agentService.getAgent(tenantId);
    return agent.dids.resolve(did);
  }

  async create(tenantId: string, method: SupportedDidMethod, keyType?: string) {
    const agent = await this.agentService.getAgent(tenantId);

    let createOptions: any;

    if (method === 'indy') {
      createOptions = {
        method: 'indy',
        options: { indyNamespace: 'digicred:test' },
      };
    } else if (method === 'key') {
      // In Credo 0.6, key type is expressed as KMS JWK params instead of KeyType enum.
      const createKey = keyType === 'p256'
        ? { kty: 'EC', crv: 'P-256' }
        : { kty: 'OKP', crv: 'Ed25519' };
      createOptions = {
        method: 'key',
        options: { createKey },
      };
    } else if (method === 'peer') {
      createOptions = { method: 'peer', options: { numAlgo: 0 } };
    } else {
      throw new Error(`Unsupported DID method: ${method}. Supported: indy, key, peer`);
    }

    this.logger.log(`Creating DID with method: ${method} for tenant: ${tenantId}`);
    const result = await agent.dids.create(createOptions);

    if (result.didState.state !== 'finished' || !result.didState.did) {
      const reason =
        result.didState.state === 'failed'
          ? (result.didState as any).reason ?? 'Unknown error'
          : result.didState.state;
      throw new Error(`DID creation failed: ${reason}`);
    }

    return result.didState;
  }

  async importFromSeed(
    tenantId: string,
    seed: string,
    verkey: string,
    shortDid: string,
    indyNamespace = 'digicred:test',
  ) {
    const agent = await this.agentService.getAgent(tenantId);

    // Build Ed25519 JWK: d = seed bytes (private), x = verkey bytes (public)
    const seedBytes = TypedArrayEncoder.fromString(seed);
    const verkeyBytes = TypedArrayEncoder.fromBase58(verkey);

    const privateJwk = {
      kty: 'OKP' as const,
      crv: 'Ed25519' as const,
      d: TypedArrayEncoder.toBase64URL(seedBytes),
      x: TypedArrayEncoder.toBase64URL(verkeyBytes),
    };

    const { keyId } = await agent.kms.importKey({ privateJwk });

    const fullDid = `did:indy:${indyNamespace}:${shortDid}`;

    // Import the DID record — resolves the DID document from the ledger
    // and links it to the private key now held in the KMS.
    await agent.dids.import({
      did: fullDid,
      keys: [{ kmsKeyId: keyId, didDocumentRelativeKeyId: '#verkey' }],
      overwrite: true,
    });

    this.logger.log(`Imported DID ${fullDid} into tenant ${tenantId}`);
    return { did: fullDid };
  }
}
