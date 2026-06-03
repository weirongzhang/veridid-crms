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
var DidService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@credo-ts/core");
const agent_service_1 = require("../agent/agent.service");
let DidService = DidService_1 = class DidService {
    agentService;
    logger = new common_1.Logger(DidService_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getAll(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        const dids = await agent.dids.getCreatedDids({});
        return dids.map((d) => ({
            did: d.did,
            method: d.did.split(':')[1] ?? 'unknown',
            createdAt: d.createdAt,
        }));
    }
    async resolve(tenantId, did) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.dids.resolve(did);
    }
    async create(tenantId, method, keyType) {
        const agent = await this.agentService.getAgent(tenantId);
        let createOptions;
        if (method === 'indy') {
            createOptions = {
                method: 'indy',
                options: { indyNamespace: 'digicred:test' },
            };
        }
        else if (method === 'key') {
            const createKey = keyType === 'p256'
                ? { kty: 'EC', crv: 'P-256' }
                : { kty: 'OKP', crv: 'Ed25519' };
            createOptions = {
                method: 'key',
                options: { createKey },
            };
        }
        else if (method === 'peer') {
            createOptions = { method: 'peer', options: { numAlgo: 0 } };
        }
        else {
            throw new Error(`Unsupported DID method: ${method}. Supported: indy, key, peer`);
        }
        this.logger.log(`Creating DID with method: ${method} for tenant: ${tenantId}`);
        const result = await agent.dids.create(createOptions);
        if (result.didState.state !== 'finished' || !result.didState.did) {
            const reason = result.didState.state === 'failed'
                ? result.didState.reason ?? 'Unknown error'
                : result.didState.state;
            throw new Error(`DID creation failed: ${reason}`);
        }
        return result.didState;
    }
    async importFromSeed(tenantId, seed, verkey, shortDid, indyNamespace = 'digicred:test') {
        const agent = await this.agentService.getAgent(tenantId);
        const seedBytes = core_1.TypedArrayEncoder.fromString(seed);
        const verkeyBytes = core_1.TypedArrayEncoder.fromBase58(verkey);
        const privateJwk = {
            kty: 'OKP',
            crv: 'Ed25519',
            d: core_1.TypedArrayEncoder.toBase64URL(seedBytes),
            x: core_1.TypedArrayEncoder.toBase64URL(verkeyBytes),
        };
        const { keyId } = await agent.kms.importKey({ privateJwk });
        const fullDid = `did:indy:${indyNamespace}:${shortDid}`;
        await agent.dids.import({
            did: fullDid,
            keys: [{ kmsKeyId: keyId, didDocumentRelativeKeyId: '#verkey' }],
            overwrite: true,
        });
        this.logger.log(`Imported DID ${fullDid} into tenant ${tenantId}`);
        return { did: fullDid };
    }
};
exports.DidService = DidService;
exports.DidService = DidService = DidService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], DidService);
//# sourceMappingURL=did.service.js.map