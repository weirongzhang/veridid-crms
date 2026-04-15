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
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@credo-ts/core");
const node_1 = require("@credo-ts/node");
const askar_1 = require("@credo-ts/askar");
const aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
const anoncreds_1 = require("@credo-ts/anoncreds");
const indy_vdr_1 = require("@credo-ts/indy-vdr");
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const anoncreds_nodejs_1 = require("@hyperledger/anoncreds-nodejs");
const BCOVRIN_TEST_GENESIS_URL = 'http://test.bcovrin.vonx.io/genesis';
const DIGICRED_GENESIS_URL = 'http://genesis.digicred.services:9000/genesis';
async function fetchGenesisTransactions(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch genesis transactions from ${url}: ${response.statusText}`);
    }
    return response.text();
}
let AgentService = AgentService_1 = class AgentService {
    configService;
    logger = new common_1.Logger(AgentService_1.name);
    agent;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        this.logger.log('Initialising Credo agent…');
        const host = this.configService.get('POSTGRES_HOST', 'localhost');
        const port = this.configService.get('POSTGRES_PORT', 5432);
        const dbUser = this.configService.get('POSTGRES_USER', 'postgres');
        const dbPassword = this.configService.get('POSTGRES_PASSWORD', 'postgres');
        const walletId = this.configService.get('AGENT_WALLET_ID', 'agent-wallet');
        const walletKey = this.configService.get('AGENT_WALLET_KEY', 'agent-wallet-key');
        const agentLabel = this.configService.get('AGENT_LABEL', 'crms-agent');
        const agentEndpoint = this.configService.get('AGENT_ENDPOINT', 'localhost');
        const agentHttpPort = this.configService.get('AGENT_HTTP_PORT', 3001);
        this.logger.log('Fetching DigiCred genesis transactions…');
        const genesisTransactions = await fetchGenesisTransactions(DIGICRED_GENESIS_URL);
        const postgresStorage = {
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
        const config = {
            label: agentLabel,
            endpoints: [agentEndpoint],
            walletConfig: {
                id: walletId,
                key: walletKey,
                storage: postgresStorage,
            },
        };
        this.agent = new core_1.Agent({
            config,
            dependencies: node_1.agentDependencies,
            modules: {
                askar: new askar_1.AskarModule({ ariesAskar: aries_askar_nodejs_1.ariesAskarNodeJS }),
                connections: new core_1.ConnectionsModule({ autoAcceptConnections: true }),
                indyVdr: new indy_vdr_1.IndyVdrModule({
                    indyVdr: indy_vdr_nodejs_1.indyVdrNodeJS,
                    networks: [
                        {
                            isProduction: false,
                            indyNamespace: 'digicred:test',
                            genesisTransactions,
                            connectOnStartup: true,
                        },
                    ],
                }),
                anoncreds: new anoncreds_1.AnonCredsModule({
                    anoncreds: anoncreds_nodejs_1.anoncredsNodeJS,
                    registries: [new indy_vdr_1.IndyVdrAnonCredsRegistry()],
                }),
            },
        });
        this.agent.registerInboundTransport(new node_1.HttpInboundTransport({ port: agentHttpPort }));
        this.agent.registerOutboundTransport(new core_1.HttpOutboundTransport());
        this.agent.registerOutboundTransport(new core_1.WsOutboundTransport());
        await this.agent.initialize();
        this.logger.log('Credo agent initialised successfully');
    }
    async getConnections() {
        return this.agent.connections.getAll();
    }
    async createOobInvitationUrl() {
        const oobRecord = await this.agent.oob.createInvitation({ multiUseInvitation: false });
        return oobRecord.outOfBandInvitation.toUrl({ domain: this.agent.config.endpoints[0] });
    }
    getAgent() {
        return this.agent;
    }
    test() {
        console.log('*** Module: agent, call method: test ***');
        return 'hello';
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AgentService);
//# sourceMappingURL=agent.service.js.map