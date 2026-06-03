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
var CredentialDefinitionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialDefinitionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const credential_definition_service_1 = require("./credential-definition.service");
let CredentialDefinitionController = CredentialDefinitionController_1 = class CredentialDefinitionController {
    credDefService;
    logger = new common_1.Logger(CredentialDefinitionController_1.name);
    constructor(credDefService) {
        this.credDefService = credDefService;
    }
    async getById(user, credDefId) {
        this.logger.log(`GET /credential-definitions/by-id?credDefId=${credDefId} - tenant: ${user.tenantId}`);
        const credDef = await this.credDefService.getById(user.tenantId, credDefId);
        return {
            success: true,
            credentialDefinition: credDef,
            schemaId: credDef.credentialDefinition.schemaId,
        };
    }
    async getAll(user) {
        this.logger.log(`GET /credential-definitions - tenant: ${user.tenantId}`);
        const credentialDefinitions = await this.credDefService.getAll(user.tenantId);
        return { success: true, credentialDefinitions };
    }
    async register(user, body) {
        this.logger.log(`POST /credential-definitions - tenant: ${user.tenantId}, schema: ${body.schemaId}, tag: ${body.tag}`);
        const result = await this.credDefService.register(user.tenantId, body.schemaId, body.tag, body.supportRevocation);
        return {
            success: true,
            message: 'Credential definition registered successfully',
            credentialDefinitionId: result.credentialDefinitionState.credentialDefinitionId,
            credentialDefinition: result.credentialDefinitionState.credentialDefinition,
        };
    }
};
exports.CredentialDefinitionController = CredentialDefinitionController;
__decorate([
    (0, common_1.Get)('by-id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a credential definition from the ledger by ID' }),
    (0, swagger_1.ApiQuery)({ name: 'credDefId', required: true, description: 'Full credential definition ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('credDefId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CredentialDefinitionController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all credential definitions created by this tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CredentialDefinitionController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new AnonCreds credential definition on the ledger' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CredentialDefinitionController.prototype, "register", null);
exports.CredentialDefinitionController = CredentialDefinitionController = CredentialDefinitionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Credential Definitions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('credential-definitions'),
    __metadata("design:paramtypes", [credential_definition_service_1.CredentialDefinitionService])
], CredentialDefinitionController);
//# sourceMappingURL=credential-definition.controller.js.map