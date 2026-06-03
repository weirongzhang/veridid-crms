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
var ProofService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofService = void 0;
const common_1 = require("@nestjs/common");
const didcomm_1 = require("@credo-ts/didcomm");
const agent_service_1 = require("../agent/agent.service");
let ProofService = ProofService_1 = class ProofService {
    agentService;
    logger = new common_1.Logger(ProofService_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    async getAll(tenantId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.proofs.getAll();
    }
    async getById(tenantId, proofId) {
        const agent = await this.agentService.getAgent(tenantId);
        return agent.didcomm.proofs.findById(proofId);
    }
    async requestProof(tenantId, connectionId, proofAttributes, credentialDefinitionId) {
        const agent = await this.agentService.getAgent(tenantId);
        const requestedAttributes = {};
        if (Array.isArray(proofAttributes)) {
            proofAttributes.forEach((attr) => {
                requestedAttributes[attr.name] = {
                    name: attr.name,
                    restrictions: credentialDefinitionId
                        ? [{ cred_def_id: credentialDefinitionId }]
                        : (attr.restrictions || []),
                };
            });
        }
        else if (typeof proofAttributes === 'object') {
            Object.assign(requestedAttributes, proofAttributes);
        }
        this.logger.log(`Requesting proof from connection ${connectionId}`);
        return agent.didcomm.proofs.requestProof({
            connectionId,
            protocolVersion: 'v2',
            proofFormats: {
                anoncreds: {
                    name: 'Proof Request',
                    version: '1.0',
                    requested_attributes: requestedAttributes,
                },
            },
            autoAcceptProof: didcomm_1.DidCommAutoAcceptProof.Always,
        });
    }
    async acceptProof(tenantId, proofId, selectedCredentials) {
        const agent = await this.agentService.getAgent(tenantId);
        const proofRecord = await agent.didcomm.proofs.findById(proofId);
        if (!proofRecord) {
            throw new Error(`Proof record ${proofId} not found`);
        }
        let requestedCredentials;
        try {
            requestedCredentials = await agent.didcomm.proofs.selectCredentialsForRequest({
                proofExchangeRecordId: proofRecord.id,
            });
        }
        catch {
            requestedCredentials = {
                proofFormats: { anoncreds: { requested_attributes: selectedCredentials } },
            };
        }
        await agent.didcomm.proofs.acceptRequest({
            proofExchangeRecordId: proofId,
            proofFormats: requestedCredentials.proofFormats,
        });
        return agent.didcomm.proofs.findById(proofId);
    }
};
exports.ProofService = ProofService;
exports.ProofService = ProofService = ProofService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], ProofService);
//# sourceMappingURL=proof.service.js.map