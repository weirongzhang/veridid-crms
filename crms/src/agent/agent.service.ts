import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Agent,
  CacheModule,
  InMemoryLruCache,
  DidsModule,
  InitConfig,
  KeyDidRegistrar,
  KeyDidResolver,
  PeerDidRegistrar,
  PeerDidResolver,
  WebDidResolver,
} from '@credo-ts/core';
import { askarNodeJS } from '@openwallet-foundation/askar-nodejs';
import { indyVdrNodeJS } from '@hyperledger/indy-vdr-nodejs';
import { anoncredsNodeJS } from '@hyperledger/anoncreds-nodejs';
import { agentDependencies, DidCommHttpInboundTransport } from '@credo-ts/node';
import { AskarModule, AskarMultiWalletDatabaseScheme } from '@credo-ts/askar';
import type { AskarPostgresStorageConfig } from '@credo-ts/askar';
import {
  AnonCredsDidCommCredentialFormatService,
  AnonCredsModule,
  AnonCredsDidCommProofFormatService,
} from '@credo-ts/anoncreds';
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidRegistrar,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
  IndyVdrSovDidResolver,
} from '@credo-ts/indy-vdr';
import { TenantsModule } from '@credo-ts/tenants';
import {
  DidCommModule,
  DidCommCredentialV2Protocol,
  DidCommProofV2Protocol,
  DidCommAutoAcceptCredential,
  DidCommAutoAcceptProof,
  DidCommHttpOutboundTransport,
  DidCommWsOutboundTransport,
} from '@credo-ts/didcomm';

const DIGICRED_GENESIS_URL = 'http://genesis.digicred.services:9000/genesis';

async function loadGenesisTransactions(
  url: string,
  envTransactions?: string,
  filePath?: string,
): Promise<string> {
  // 1. Inline env var (fastest, works offline)
  if (envTransactions) {
    return envTransactions;
  }

  // 2. Local file fallback
  if (filePath) {
    const { readFileSync } = await import('fs');
    return readFileSync(filePath, 'utf8');
  }

  // 3. Remote fetch with timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.text();
  } catch (err: any) {
    throw new Error(
      `Cannot reach genesis URL ${url}: ${err.message}.\n` +
      `Set GENESIS_TRANSACTIONS (raw text) or GENESIS_TRANSACTIONS_PATH (local file) in .env to work offline.`,
    );
  } finally {
    clearTimeout(timer);
  }
}

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private mainAgent!: Agent;
  private agentEndpoint!: string;
  private readonly tenantAgentCache: Record<string, Agent<any>> = {};
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Initialising Credo agent…');
    await this.initializeMainAgent();
  }

  private async initializeMainAgent(): Promise<void> {
    const host = this.configService.get<string>('POSTGRES_HOST', 'localhost');
    const port = this.configService.get<number>('POSTGRES_PORT', 5432);
    const dbUser = this.configService.get<string>('POSTGRES_USER', 'postgres');
    const dbPassword = this.configService.get<string>('POSTGRES_PASSWORD', 'postgres');
    const walletId = this.configService.get<string>('AGENT_WALLET_ID', 'agent-wallet');
    const walletKey = this.configService.get<string>('AGENT_WALLET_KEY', 'agent-wallet-key');
    const agentLabel = this.configService.get<string>('AGENT_LABEL', 'crms-agent');
    this.agentEndpoint = this.configService.get<string>('AGENT_ENDPOINT', 'http://localhost:3011');
    const agentHttpPort = this.configService.get<number>('AGENT_HTTP_PORT', 3011);
    const sessionTimeout = this.configService.get<number>('AGENT_SESSION_TIMEOUT', 5000);

    const genesisUrl = this.configService.get<string>('GENESIS_URL', DIGICRED_GENESIS_URL);
    const genesisEnv = this.configService.get<string>('GENESIS_TRANSACTIONS');
    const genesisFile = this.configService.get<string>('GENESIS_TRANSACTIONS_PATH');

    this.logger.log('Loading DigiCred genesis transactions…');
    const genesisTransactions = await loadGenesisTransactions(genesisUrl, genesisEnv, genesisFile);

    const postgresStorage: AskarPostgresStorageConfig = {
      type: 'postgres',
      config: { host: `${host}:${port}` },
      credentials: {
        account: dbUser,
        password: dbPassword,
        adminAccount: dbUser,
        adminPassword: dbPassword,
      },
    };

    // In Credo 0.6, label/endpoints/walletConfig are removed from InitConfig.
    // walletConfig moves to AskarModule.store; endpoints move to DidCommModule.
    const config: InitConfig = {};

    this.mainAgent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule({
          askar: askarNodeJS,
          multiWalletDatabaseScheme: AskarMultiWalletDatabaseScheme.DatabasePerWallet,
          store: {
            id: walletId,
            key: walletKey,
            database: postgresStorage,
          },
        }),
        dids: new DidsModule({
          registrars: [new IndyVdrIndyDidRegistrar(), new KeyDidRegistrar(), new PeerDidRegistrar()],
          resolvers: [new IndyVdrIndyDidResolver(), new IndyVdrSovDidResolver(), new KeyDidResolver(), new PeerDidResolver(), new WebDidResolver()],
        }),
        didcomm: new DidCommModule({
          endpoints: [this.agentEndpoint],
          connections: { autoAcceptConnections: true },
          credentials: {
            autoAcceptCredentials: DidCommAutoAcceptCredential.Always,
            credentialProtocols: [
              new DidCommCredentialV2Protocol({
                credentialFormats: [new AnonCredsDidCommCredentialFormatService()],
              }),
            ],
          },
          proofs: {
            autoAcceptProofs: DidCommAutoAcceptProof.Always,
            proofProtocols: [
              new DidCommProofV2Protocol({
                proofFormats: [new AnonCredsDidCommProofFormatService()],
              }),
            ],
          },
        }),
        indyVdr: new IndyVdrModule({
          indyVdr: indyVdrNodeJS,
          networks: [
            {
              isProduction: false,
              indyNamespace: this.configService.get<string>('INDY_NAMESPACE', 'digicred:test'),
              genesisTransactions,
              // Connect lazily so startup never blocks on ledger availability
              connectOnStartup: true,
            },
          ],
        }),
        anoncreds: new AnonCredsModule({
          anoncreds: anoncredsNodeJS,
          registries: [new IndyVdrAnonCredsRegistry()],
        }),
        cache: new CacheModule({
          cache: new InMemoryLruCache({ limit: 500 }),
        }),
        tenants: new TenantsModule({
          sessionAcquireTimeout: sessionTimeout,
          sessionLimit: 10,
        }),
      },
    });

    this.mainAgent.didcomm.registerInboundTransport(new DidCommHttpInboundTransport({ port: agentHttpPort }));
    this.mainAgent.didcomm.registerOutboundTransport(new DidCommHttpOutboundTransport());
    this.mainAgent.didcomm.registerOutboundTransport(new DidCommWsOutboundTransport());

    await this.mainAgent.initialize();
    // In Credo 0.6, key creation uses KMS options (kty/crv) instead of KeyType enum.
    // Private key injection via secret is no longer supported for key DIDs.
    await this.mainAgent.dids.create({
      method: 'key',
      options: { createKey: { kty: 'OKP', crv: 'Ed25519' } },
    });
    this.logger.log(`Credo agent initialised successfully (label: ${agentLabel})`);
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = this.MAX_RETRIES, delay = this.RETRY_DELAY_MS): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0 || !error.message?.includes('Failed to acquire an agent context session')) {
        throw error;
      }
      this.logger.warn(`Retrying in ${delay}ms (${retries} left): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 1.5);
    }
  }

  async getAgent(tenantId: string): Promise<Agent<any>> {
    if (this.tenantAgentCache[tenantId]) {
      return this.tenantAgentCache[tenantId];
    }

    const tenantAgent = await this.withRetry(() =>
      (this.mainAgent.modules as any).tenants.getTenantAgent({ tenantId }),
    ) as Agent<any>;

    this.tenantAgentCache[tenantId] = tenantAgent;
    this.logger.log(`Cached tenant agent for tenant: ${tenantId}`);
    return tenantAgent;
  }

  async createTenant(label: string): Promise<{ tenantId: string }> {
    const tenant = await this.withRetry(() =>
      (this.mainAgent.modules as any).tenants.createTenant({ config: { label } }),
    ) as any;

    if (tenant?.id && this.tenantAgentCache[tenant.id]) {
      delete this.tenantAgentCache[tenant.id];
    }

    return { tenantId: tenant.id };
  }

  async validateCredentials(tenantId: string): Promise<boolean> {
    try {
      await this.getAgent(tenantId);
      return true;
    } catch {
      return false;
    }
  }

  getMainAgent(): Agent {
    return this.mainAgent;
  }

  async getConnections() {
    return this.mainAgent.didcomm.connections.getAll();
  }

  async createOobInvitationUrl(): Promise<string> {
    const oobRecord = await this.mainAgent.didcomm.oob.createInvitation({ multiUseInvitation: false });
    return oobRecord.outOfBandInvitation.toUrl({ domain: this.agentEndpoint });
  }

  test(): string {
    return 'hello';
  }
}
