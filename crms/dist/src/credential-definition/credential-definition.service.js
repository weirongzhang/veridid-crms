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
var CredentialDefinitionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialDefinitionService = void 0;
const common_1 = require("@nestjs/common");
const agent_service_1 = require("../agent/agent.service");
let CredentialDefinitionService = CredentialDefinitionService_1 = class CredentialDefinitionService {
    agentService;
    logger = new common_1.Logger(CredentialDefinitionService_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getAll(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.modules.anoncreds.getCreatedCredentialDefinitions({});
    }
    async getById(tenantId, credDefId) {
        const agent = await this.agentService.getAgent(tenantId);
        const credDefs = await agent.modules.anoncreds.getCreatedCredentialDefinitions({
            credentialDefinitionId: credDefId,
        });
        const credDef = credDefs[0];
        if (!credDef) {
            throw new common_1.NotFoundException(`Credential definition ${credDefId} not found`);
        }
        return credDef;
    }
    async register(tenantId, schemaId, tag, supportRevocation) {
        const agent = await this.agentService.getAgent(tenantId);
        const schemaResult = await agent.modules.anoncreds.getSchema(schemaId);
        if (!schemaResult.schema) {
            throw new common_1.NotFoundException(`Schema ${schemaId} not found`);
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
            throw new Error(`Credential definition registration failed: ${result.credentialDefinitionState.reason ?? result.credentialDefinitionState.state}`);
        }
        return result;
    }
};
exports.CredentialDefinitionService = CredentialDefinitionService;
exports.CredentialDefinitionService = CredentialDefinitionService = CredentialDefinitionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], CredentialDefinitionService);
//# sourceMappingURL=credential-definition.service.js.map