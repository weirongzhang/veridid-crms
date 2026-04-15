import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Agent,
  ConnectionsModule,
  HttpOutboundTransport,
  InitConfig,
  WsOutboundTransport,
} from '@credo-ts/core';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';
import { AskarModule } from '@credo-ts/askar';
import type { AskarWalletPostgresStorageConfig } from '@credo-ts/askar';
import { ariesAskarNodeJS } from '@hyperledger/aries-askar-nodejs';
import { AnonCredsModule } from '@credo-ts/anoncreds';
import { IndyVdrAnonCredsRegistry, IndyVdrModule } from '@credo-ts/indy-vdr';
import { indyVdrNodeJS } from '@hyperledger/indy-vdr-nodejs';
import { anoncredsNodeJS } from '@hyperledger/anoncreds-nodejs';

const BCOVRIN_TEST_GENESIS_URL = 'http://test.bcovrin.vonx.io/genesis';
const DIGICRED_GENESIS_URL = 'http://genesis.digicred.services:9000/genesis';

async function fetchGenesisTransactions(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch genesis transactions from ${url}: ${response.statusText}`);
  }
  return response.text();
}

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private agent!: Agent;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Initialising Credo agent…');

    const host = this.configService.get<string>('POSTGRES_HOST', 'localhost');
    const port = this.configService.get<number>('POSTGRES_PORT', 5432);
    const dbUser = this.configService.get<string>('POSTGRES_USER', 'postgres');
    const dbPassword = this.configService.get<string>('POSTGRES_PASSWORD', 'postgres');
    const walletId = this.configService.get<string>('AGENT_WALLET_ID', 'agent-wallet');
    const walletKey = this.configService.get<string>('AGENT_WALLET_KEY', 'agent-wallet-key');
    const agentLabel = this.configService.get<string>('AGENT_LABEL', 'crms-agent');
    const agentEndpoint = this.configService.get<string>('AGENT_ENDPOINT', 'localhost');
    const agentHttpPort = this.configService.get<number>('AGENT_HTTP_PORT', 3001);

    this.logger.log('Fetching DigiCred genesis transactions…');
    const genesisTransactions = await fetchGenesisTransactions(DIGICRED_GENESIS_URL);

    const postgresStorage: AskarWalletPostgresStorageConfig = {
      type: 'postgres',
      config: {
        host: `${host}:${port}`,
      },
      credentials: {
        account: dbUser,
        password: dbPassword,
        adminAccount: dbUser,
        adminPassword: dbPassword,
      },
    };

    const config: InitConfig = {
      label: agentLabel,
      endpoints: [agentEndpoint],
      walletConfig: {
        id: walletId,
        key: walletKey,
        storage: postgresStorage,
      },
    };

    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        askar: new AskarModule({ ariesAskar: ariesAskarNodeJS }),
        connections: new ConnectionsModule({ autoAcceptConnections: true }),
        indyVdr: new IndyVdrModule({
          indyVdr: indyVdrNodeJS,
          networks: [
            {
              isProduction: false,
              indyNamespace: 'digicred:test',
              genesisTransactions,
              connectOnStartup: true,
            },
          ],
        }),
        anoncreds: new AnonCredsModule({
          anoncreds: anoncredsNodeJS,
          registries: [new IndyVdrAnonCredsRegistry()],
        }),
      },
    });

    this.agent.registerInboundTransport(new HttpInboundTransport({ port: agentHttpPort }));
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
    this.agent.registerOutboundTransport(new WsOutboundTransport());

    await this.agent.initialize();
    this.logger.log('Credo agent initialised successfully');
  }

  async getConnections() {
    return this.agent.connections.getAll();
  }

  async createOobInvitationUrl(): Promise<string> {
    const oobRecord = await this.agent.oob.createInvitation({ multiUseInvitation: false });
    return oobRecord.outOfBandInvitation.toUrl({ domain: this.agent.config.endpoints[0] });
  }

  getAgent(): Agent {
    return this.agent;
  }

  test(): string {
    console.log('*** Module: agent, call method: test ***');
    return 'hello';
  }
}
