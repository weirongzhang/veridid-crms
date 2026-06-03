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
var CredentialService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialService = void 0;
const common_1 = require("@nestjs/common");
const didcomm_1 = require("@credo-ts/didcomm");
const agent_service_1 = require("../agent/agent.service");
let CredentialService = CredentialService_1 = class CredentialService {
    agentService;
    logger = new common_1.Logger(CredentialService_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getAll(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.credentials.getAll();
    }
    async getById(tenantId, credentialId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.credentials.findById(credentialId);
    }
    async issueCredential(tenantId, connectionId, credentialDefinitionId, attributes) {
        const agent = await this.agentService.getAgent(tenantId);
        const credDefResult = await agent.modules.anoncreds.getCredentialDefinition(credentialDefinitionId);
        const credDef = credDefResult.credentialDefinition;
        if (!credDef) {
            throw new Error(`Credential definition ${credentialDefinitionId} not found`);
        }
        const schemaResult = await agent.modules.anoncreds.getSchema(credDef.schemaId);
        const schema = schemaResult.schema;
        if (!schema) {
            throw new Error(`Schema ${credDef.schemaId} not found`);
        }
        const credentialAttributes = schema.attrNames.map((name) => ({
            name,
            value: attributes[name] ?? '',
        }));
        this.logger.log(`Issuing credential to connection ${connectionId} with definition ${credentialDefinitionId}`);
        return agent.didcomm.credentials.offerCredential({
            connectionId,
            protocolVersion: 'v2',
            credentialFormats: {
                anoncreds: {
                    credentialDefinitionId,
                    attributes: credentialAttributes,
                },
            },
            autoAcceptCredential: didcomm_1.DidCommAutoAcceptCredential.Always,
        });
    }
};
exports.CredentialService = CredentialService;
exports.CredentialService = CredentialService = CredentialService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], CredentialService);
//# sourceMappingURL=credential.service.js.map