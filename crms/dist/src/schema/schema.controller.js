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
var SchemaController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const schema_service_1 = require("./schema.service");
const schema_dto_1 = require("./schema.dto");
let SchemaController = SchemaController_1 = class SchemaController {
    schemaService;
    logger = new common_1.Logger(SchemaController_1.name);
    constructor(schemaService) {
        this.schemaService = schemaService;
    }
    async getAvailableDids(user) {
        this.logger.log(`GET /schemas/available-dids - tenant: ${user.tenantId}`);
        const result = await this.schemaService.getAvailableDids(user.tenantId);
        return { success: true, ...result };
    }
    async getBySchemaId(user, schemaId) {
        this.logger.log(`GET /schemas/by-id?schemaId=${schemaId} - tenant: ${user.tenantId}`);
        const schema = await this.schemaService.getBySchemaId(user.tenantId, schemaId);
        return { success: true, schema };
    }
    async getAll(user) {
        this.logger.log(`GET /schemas - tenant: ${user.tenantId}`);
        const schemas = await this.schemaService.getAll(user.tenantId);
        return { success: true, schemas };
    }
    async register(user, body, SchemaDTO) {
        this.logger.log(`POST /schemas - tenant: ${user.tenantId}, schema: ${body.name} v${body.version}`);
        const result = await this.schemaService.registerSchema(user.tenantId, body.name, body.version, body.attrNames, body.issuerId);
        return {
            success: true,
            message: 'Schema registered successfully',
            schemaId: result.schemaState.schemaId,
            schema: result.schemaState.schema,
        };
    }
};
exports.SchemaController = SchemaController;
__decorate([
    (0, common_1.Get)('available-dids'),
    (0, swagger_1.ApiOperation)({ summary: 'List DIDs available for schema issuance' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchemaController.prototype, "getAvailableDids", null);
__decorate([
    (0, common_1.Get)('by-id'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch a schema from the ledger by schema ID' }),
    (0, swagger_1.ApiQuery)({ name: 'schemaId', required: true, description: 'Full schema ID (e.g. did:indy:…)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('schemaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SchemaController.prototype, "getBySchemaId", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all schemas created by this tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SchemaController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new schema on the ledger' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, schema_dto_1.SchemaDTO, Object]),
    __metadata("design:returntype", Promise)
], SchemaController.prototype, "register", null);
exports.SchemaController = SchemaController = SchemaController_1 = __decorate([
    (0, swagger_1.ApiTags)('Schemas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('schemas'),
    __metadata("design:paramtypes", [schema_service_1.SchemaService])
], SchemaController);
//# sourceMappingURL=schema.controller.js.map