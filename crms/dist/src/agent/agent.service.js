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
const askar_nodejs_1 = require("@openwallet-foundation/askar-nodejs");
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const anoncreds_nodejs_1 = require("@hyperledger/anoncreds-nodejs");
const node_1 = require("@credo-ts/node");
const askar_1 = require("@credo-ts/askar");
const anoncreds_1 = require("@credo-ts/anoncreds");
const indy_vdr_1 = require("@credo-ts/indy-vdr");
const tenants_1 = require("@credo-ts/tenants");
const didcomm_1 = require("@credo-ts/didcomm");
const DIGICRED_GENESIS_URL = 'http://genesis.digicred.services:9000/genesis';
async function loadGenesisTransactions(url, envTransactions, filePath) {
    if (envTransactions) {
        return envTransactions;
    }
    if (filePath) {
        const { readFileSync } = await import('fs');
        return readFileSync(filePath, 'utf8');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
    }
    catch (err) {
        throw new Error(`Cannot reach genesis URL ${url}: ${err.message}.\n` +
            `Set GENESIS_TRANSACTIONS (raw text) or GENESIS_TRANSACTIONS_PATH (local file) in .env to work offline.`);
    }
    finally {
        clearTimeout(timer);
    }
}
let AgentService = AgentService_1 = class AgentService {
    configService;
    logger = new common_1.Logger(AgentService_1.name);
    mainAgent;
    agentEndpoint;
    tenantAgentCache = {};
    MAX_RETRIES = 3;
    RETRY_DELAY_MS = 1000;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        this.logger.log('Initialising Credo agent…');
        await this.initializeMainAgent();
    }
    async initializeMainAgent() {
        const host = this.configService.get('POSTGRES_HOST', 'localhost');
        const port = this.configService.get('POSTGRES_PORT', 5432);
        const dbUser = this.configService.get('POSTGRES_USER', 'postgres');
        const dbPassword = this.configService.get('POSTGRES_PASSWORD', 'postgres');
        const walletId = this.configService.get('AGENT_WALLET_ID', 'agent-wallet');
        const walletKey = this.configService.get('AGENT_WALLET_KEY', 'agent-wallet-key');
        const agentLabel = this.configService.get('AGENT_LABEL', 'crms-agent');
        this.agentEndpoint = this.configService.get('AGENT_ENDPOINT', 'http://localhost:3011');
        const agentHttpPort = this.configService.get('AGENT_HTTP_PORT', 3011);
        const sessionTimeout = this.configService.get('AGENT_SESSION_TIMEOUT', 5000);
        const genesisUrl = this.configService.get('GENESIS_URL', DIGICRED_GENESIS_URL);
        const genesisEnv = this.configService.get('GENESIS_TRANSACTIONS');
        const genesisFile = this.configService.get('GENESIS_TRANSACTIONS_PATH');
        this.logger.log('Loading DigiCred genesis transactions…');
        const genesisTransactions = await loadGenesisTransactions(genesisUrl, genesisEnv, genesisFile);
        const postgresStorage = {
            type: 'postgres',
            config: { host: `${host}:${port}` },
            credentials: {
                account: dbUser,
                password: dbPassword,
                adminAccount: dbUser,
                adminPassword: dbPassword,
            },
        };
        const config = {};
        this.mainAgent = new core_1.Agent({
            config,
            dependencies: node_1.agentDependencies,
            modules: {
                askar: new askar_1.AskarModule({
                    askar: askar_nodejs_1.askarNodeJS,
                    multiWalletDatabaseScheme: askar_1.AskarMultiWalletDatabaseScheme.DatabasePerWallet,
                    store: {
                        id: walletId,
                        key: walletKey,
                        database: postgresStorage,
                    },
                }),
                dids: new core_1.DidsModule({
                    registrars: [new indy_vdr_1.IndyVdrIndyDidRegistrar(), new core_1.KeyDidRegistrar(), new core_1.PeerDidRegistrar()],
                    resolvers: [new indy_vdr_1.IndyVdrIndyDidResolver(), new indy_vdr_1.IndyVdrSovDidResolver(), new core_1.KeyDidResolver(), new core_1.PeerDidResolver(), new core_1.WebDidResolver()],
                }),
                didcomm: new didcomm_1.DidCommModule({
                    endpoints: [this.agentEndpoint],
                    connections: { autoAcceptConnections: true },
                    credentials: {
                        autoAcceptCredentials: didcomm_1.DidCommAutoAcceptCredential.Always,
                        credentialProtocols: [
                            new didcomm_1.DidCommCredentialV2Protocol({
                                credentialFormats: [new anoncreds_1.AnonCredsDidCommCredentialFormatService()],
                            }),
                        ],
                    },
                    proofs: {
                        autoAcceptProofs: didcomm_1.DidCommAutoAcceptProof.Always,
                        proofProtocols: [
                            new didcomm_1.DidCommProofV2Protocol({
                                proofFormats: [new anoncreds_1.AnonCredsDidCommProofFormatService()],
                            }),
                        ],
                    },
                }),
                indyVdr: new indy_vdr_1.IndyVdrModule({
                    indyVdr: indy_vdr_nodejs_1.indyVdrNodeJS,
                    networks: [
                        {
                            isProduction: false,
                            indyNamespace: this.configService.get('INDY_NAMESPACE', 'digicred:test'),
                            genesisTransactions,
                            connectOnStartup: true,
                        },
                    ],
                }),
                anoncreds: new anoncreds_1.AnonCredsModule({
                    anoncreds: anoncreds_nodejs_1.anoncredsNodeJS,
                    registries: [new indy_vdr_1.IndyVdrAnonCredsRegistry()],
                }),
                cache: new core_1.CacheModule({
                    cache: new core_1.InMemoryLruCache({ limit: 500 }),
                }),
                tenants: new tenants_1.TenantsModule({
                    sessionAcquireTimeout: sessionTimeout,
                    sessionLimit: 10,
                }),
            },
        });
        this.mainAgent.didcomm.registerInboundTransport(new node_1.DidCommHttpInboundTransport({ port: agentHttpPort }));
        this.mainAgent.didcomm.registerOutboundTransport(new didcomm_1.DidCommHttpOutboundTransport());
        this.mainAgent.didcomm.registerOutboundTransport(new didcomm_1.DidCommWsOutboundTransport());
        await this.mainAgent.initialize();
        await this.mainAgent.dids.create({
            method: 'key',
            options: { createKey: { kty: 'OKP', crv: 'Ed25519' } },
        });
        this.logger.log(`Credo agent initialised successfully (label: ${agentLabel})`);
    }
    async withRetry(fn, retries = this.MAX_RETRIES, delay = this.RETRY_DELAY_MS) {
        try {
            return await fn();
        }
        catch (error) {
            if (retries <= 0 || !error.message?.includes('Failed to acquire an agent context session')) {
                throw error;
            }
            this.logger.warn(`Retrying in ${delay}ms (${retries} left): ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.withRetry(fn, retries - 1, delay * 1.5);
        }
    }
    async getAgent(tenantId) {
        if (this.tenantAgentCache[tenantId]) {
            return this.tenantAgentCache[tenantId];
        }
        const tenantAgent = await this.withRetry(() => this.mainAgent.modules.tenants.getTenantAgent({ tenantId }));
        this.tenantAgentCache[tenantId] = tenantAgent;
        this.logger.log(`Cached tenant agent for tenant: ${tenantId}`);
        return tenantAgent;
    }
    async createTenant(label) {
        const tenant = await this.withRetry(() => this.mainAgent.modules.tenants.createTenant({ config: { label } }));
        if (tenant?.id && this.tenantAgentCache[tenant.id]) {
            delete this.tenantAgentCache[tenant.id];
        }
        return { tenantId: tenant.id };
    }
    async validateCredentials(tenantId) {
        try {
            await this.getAgent(tenantId);
            return true;
        }
        catch {
            return false;
        }
    }
    getMainAgent() {
        return this.mainAgent;
    }
    async getConnections() {
        return this.mainAgent.didcomm.connections.getAll();
    }
    async createOobInvitationUrl() {
        const oobRecord = await this.mainAgent.didcomm.oob.createInvitation({ multiUseInvitation: false });
        return oobRecord.outOfBandInvitation.toUrl({ domain: this.agentEndpoint });
    }
    test() {
        return 'hello';
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AgentService);
//# sourceMappingURL=agent.service.js.map