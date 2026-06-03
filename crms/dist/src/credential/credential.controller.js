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
var CredentialController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const credential_service_1 = require("./credential.service");
let CredentialController = CredentialController_1 = class CredentialController {
    credentialService;
    logger = new common_1.Logger(CredentialController_1.name);
    constructor(credentialService) {
        this.credentialService = credentialService;
    }
    async getAll(user) {
        this.logger.log(`GET /credentials - tenant: ${user.tenantId}`);
        const credentials = await this.credentialService.getAll(user.tenantId);
        return {
            success: true,
            credentials: credentials.map((c) => ({
                id: c.id,
                state: c.state,
                createdAt: c.createdAt,
                connectionId: c.connectionId,
            })),
        };
    }
    async issue(user, body) {
        this.logger.log(`POST /credentials/issue - tenant: ${user.tenantId}`);
        const record = await this.credentialService.issueCredential(user.tenantId, body.connectionId, body.credentialDefinitionId, body.attributes);
        return {
            success: true,
            credential: {
                id: record.id,
                state: record.state,
                connectionId: record.connectionId,
                threadId: record.threadId,
                credentialDefinitionId: body.credentialDefinitionId,
            },
        };
    }
    async getById(user, credentialId) {
        this.logger.log(`GET /credentials/${credentialId} - tenant: ${user.tenantId}`);
        const credential = await this.credentialService.getById(user.tenantId, credentialId);
        if (!credential) {
            throw new common_1.NotFoundException(`Credential ${credentialId} not found`);
        }
        return {
            success: true,
            credential: {
                id: credential.id,
                state: credential.state,
                createdAt: credential.createdAt,
                connectionId: credential.connectionId,
                attributes: credential.credentialAttributes,
            },
        };
    }
};
exports.CredentialController = CredentialController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all credential exchange records' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)('issue'),
    (0, swagger_1.ApiOperation)({ summary: 'Issue a credential to a connection via AnonCreds' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "issue", null);
__decorate([
    (0, common_1.Get)(':credentialId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a credential exchange record by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('credentialId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CredentialController.prototype, "getById", null);
exports.CredentialController = CredentialController = CredentialController_1 = __decorate([
    (0, swagger_1.ApiTags)('Credentials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('credentials'),
    __metadata("design:paramtypes", [credential_service_1.CredentialService])
], CredentialController);
//# sourceMappingURL=credential.controller.js.map