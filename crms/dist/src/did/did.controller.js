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
var DidController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DidController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const did_service_1 = require("./did.service");
const did_dto_1 = require("./did.dto");
let DidController = DidController_1 = class DidController {
    didService;
    logger = new common_1.Logger(DidController_1.name);
    constructor(didService) {
        this.didService = didService;
    }
    async getAll(user) {
        this.logger.log(`GET /dids - tenant: ${user.tenantId}`);
        const dids = await this.didService.getAll(user.tenantId);
        return { success: true, dids };
    }
    async resolve(user, did) {
        this.logger.log(`GET /dids/resolve/${did} - tenant: ${user.tenantId}`);
        const result = await this.didService.resolve(user.tenantId, decodeURIComponent(did));
        return {
            success: true,
            didDocument: result.didDocument,
            didResolutionMetadata: result.didResolutionMetadata,
        };
    }
    async importFromSeed(user, body) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Your account has no SSI wallet. Please register a new account.');
        }
        this.logger.log(`POST /dids/import-seed - tenant: ${user.tenantId}, did: ${body.did}`);
        try {
            const result = await this.didService.importFromSeed(user.tenantId, body.seed, body.verkey, body.did, body.indyNamespace ?? 'digicred:test');
            return {
                success: true,
                message: 'DID imported successfully. You can now use it as issuerId for schemas.',
                did: result.did,
            };
        }
        catch (err) {
            this.logger.error(`POST /dids/import-seed failed: ${err.message}`, err.stack);
            throw new common_1.InternalServerErrorException(err.message ?? 'DID import failed');
        }
    }
    async create(user, body) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Your account has no SSI wallet. Please register a new account — the current account was created before the agent was running.');
        }
        this.logger.log(`POST /dids - tenant: ${user.tenantId}, method: ${body.method}`);
        try {
            const didState = await this.didService.create(user.tenantId, body.method, body.keyType);
            return {
                success: true,
                message: 'DID created successfully',
                did: {
                    did: didState.did,
                    method: body.method,
                    didDocument: didState.didDocument,
                    createdAt: new Date().toISOString(),
                },
            };
        }
        catch (err) {
            this.logger.error(`POST /dids failed: ${err.message}`, err.stack);
            throw new common_1.InternalServerErrorException(err.message ?? 'DID creation failed');
        }
    }
};
exports.DidController = DidController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all DIDs created by this tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DidController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('resolve/:did'),
    (0, swagger_1.ApiOperation)({ summary: 'Resolve any DID document' }),
    (0, swagger_1.ApiParam)({ name: 'did', description: 'URL-encoded DID string' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('did')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DidController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('import-seed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Import a DID registered on the ledger via seed',
        description: 'Use the seed, verkey, and short DID from genesis.digicred.services to import the DID into your wallet.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, did_dto_1.ImportSeedDidDto]),
    __metadata("design:returntype", Promise)
], DidController.prototype, "importFromSeed", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new DID',
        description: 'Supported methods: "indy" (registered on digicred:test), "key" (local), "peer" (local)',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, did_dto_1.CreateDidDto]),
    __metadata("design:returntype", Promise)
], DidController.prototype, "create", null);
exports.DidController = DidController = DidController_1 = __decorate([
    (0, swagger_1.ApiTags)('DIDs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('dids'),
    __metadata("design:paramtypes", [did_service_1.DidService])
], DidController);
//# sourceMappingURL=did.controller.js.map