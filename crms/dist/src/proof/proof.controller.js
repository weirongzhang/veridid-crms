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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProofController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const proof_service_1 = require("./proof.service");
let ProofController = ProofController_1 = class ProofController {
    proofService;
    logger = new common_1.Logger(ProofController_1.name);
    constructor(proofService) {
        this.proofService = proofService;
    }
    async getAll(user) {
        this.logger.log(`GET /proofs - tenant: ${user.tenantId}`);
        const proofs = await this.proofService.getAll(user.tenantId);
        return {
            success: true,
            proofs: proofs.map((p) => ({
                id: p.id,
                state: p.state,
                createdAt: p.createdAt,
                connectionId: p.connectionId,
                threadId: p.threadId,
                isVerified: p.isVerified,
            })),
        };
    }
    async requestProof(user, body) {
        this.logger.log(`POST /proofs/request - tenant: ${user.tenantId}`);
        const proof = await this.proofService.requestProof(user.tenantId, body.connectionId, body.proofAttributes, body.credentialDefinitionId);
        return {
            success: true,
            proof: {
                id: proof.id,
                state: proof.state,
                connectionId: proof.connectionId,
                threadId: proof.threadId,
            },
        };
    }
    async acceptProof(user, proofId, body) {
        this.logger.log(`POST /proofs/${proofId}/accept - tenant: ${user.tenantId}`);
        const updated = await this.proofService.acceptProof(user.tenantId, proofId, body.selectedCredentials);
        if (!updated) {
            throw new common_1.NotFoundException(`Proof ${proofId} not found after accept`);
        }
        return {
            success: true,
            proof: {
                id: updated.id,
                state: updated.state,
                connectionId: updated.connectionId,
                threadId: updated.threadId,
                isVerified: updated.isVerified,
            },
        };
    }
    async getById(user, proofId) {
        this.logger.log(`GET /proofs/${proofId} - tenant: ${user.tenantId}`);
        const proof = await this.proofService.getById(user.tenantId, proofId);
        if (!proof) {
            throw new common_1.NotFoundException(`Proof ${proofId} not found`);
        }
        return {
            success: true,
            proof: {
                id: proof.id,
                state: proof.state,
                createdAt: proof.createdAt,
                connectionId: proof.connectionId,
                threadId: proof.threadId,
                isVerified: proof.isVerified,
            },
        };
    }
};
exports.ProofController = ProofController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all proof exchange records' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)('request'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a proof request to a connection' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "requestProof", null);
__decorate([
    (0, common_1.Post)(':proofId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept a proof request by selecting matching credentials' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('proofId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "acceptProof", null);
__decorate([
    (0, common_1.Get)(':proofId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a proof exchange record by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('proofId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "getById", null);
exports.ProofController = ProofController = ProofController_1 = __decorate([
    (0, swagger_1.ApiTags)('Proofs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('proofs'),
    __metadata("design:paramtypes", [proof_service_1.ProofService])
], ProofController);
//# sourceMappingURL=proof.controller.js.map