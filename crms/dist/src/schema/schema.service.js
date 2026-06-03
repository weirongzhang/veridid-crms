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
var SchemaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent/agent.service");
let SchemaService = SchemaService_1 = class SchemaService {
    agentService;
    logger = new common_1.Logger(SchemaService_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getAll(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.modules.anoncreds.getCreatedSchemas({});
    }
    async getBySchemaId(tenantId, schemaId) {
        const agent = await this.agentService.getAgent(tenantId);
        const result = await agent.modules.anoncreds.getSchema(schemaId);
        if (!result.schema) {
            throw new common_1.NotFoundException(`Schema ${schemaId} not found`);
        }
        return result;
    }
    async getAvailableDids(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        const dids = await agent.dids.getCreatedDids({});
        const didsByType = {};
        dids.forEach((d) => {
            const type = d.did.split(':')[1] ?? 'unknown';
            if (!didsByType[type])
                didsByType[type] = [];
            didsByType[type].push({ did: d.did, createdAt: d.createdAt });
        });
        return {
            dids: dids.map((d) => ({ did: d.did, type: d.did.split(':')[1], createdAt: d.createdAt })),
            didsByType,
        };
    }
    async registerSchema(tenantId, name, version, attrNames, issuerId) {
        const agent = await this.agentService.getAgent(tenantId);
        const dids = await agent.dids.getCreatedDids({});
        const issuerDid = dids.find((d) => d.did === issuerId);
        if (!issuerDid) {
            const available = dids.map((d) => d.did);
            throw new common_1.BadRequestException(`Issuer DID "${issuerId}" not found in this tenant's wallet. Available: ${available.join(', ')}`);
        }
        this.logger.log(`Registering schema: ${name} v${version} for issuer ${issuerId}`);
        const result = await agent.modules.anoncreds.registerSchema({
            schema: { attrNames, issuerId, name, version },
            options: {},
        });
        if (result.schemaState.state !== 'finished') {
            throw new Error(`Schema registration failed: ${result.schemaState.reason ?? result.schemaState.state}`);
        }
        return result;
    }
};
exports.SchemaService = SchemaService;
exports.SchemaService = SchemaService = SchemaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], SchemaService);
//# sourceMappingURL=schema.service.js.map