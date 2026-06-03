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
var AgentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/public.decorator");
const agent_service_1 = require("./agent.service");
let AgentController = AgentController_1 = class AgentController {
    agentService;
    logger = new common_1.Logger(AgentController_1.name);
    constructor(agentService) {
        this.agentService = agentService;
    }
    test() {
        this.logger.log('GET /agent/test');
        return this.agentService.test();
    }
    async getConnections() {
        this.logger.log('GET /agent/connections');
        return this.agentService.getConnections();
    }
    async createInvitation() {
        this.logger.log('GET /agent/invitation');
        return this.agentService.createOobInvitationUrl();
    }
    async initialize(body) {
        this.logger.log(`POST /agent/initialize - tenant: ${body.tenantId}`);
        if (!body.tenantId) {
            return { success: false, message: 'Tenant ID is required' };
        }
        try {
            await this.agentService.getAgent(body.tenantId);
            return { success: true, message: 'Agent initialized successfully', tenantId: body.tenantId };
        }
        catch (error) {
            return { success: false, message: error.message || 'Failed to initialize agent' };
        }
    }
    async validate(body) {
        this.logger.log(`POST /agent/validate - tenant: ${body.tenantId}`);
        if (!body.tenantId) {
            return { success: false, message: 'Tenant ID is required' };
        }
        const isValid = await this.agentService.validateCredentials(body.tenantId);
        return {
            success: isValid,
            message: isValid ? 'Credentials are valid' : 'Invalid credentials',
        };
    }
    async createTenant(body) {
        this.logger.log(`POST /agent/tenant - label: ${body.label}`);
        if (!body.label) {
            return { success: false, message: 'Tenant label is required' };
        }
        try {
            const tenant = await this.agentService.createTenant(body.label);
            return { success: true, message: 'Tenant created successfully', tenantId: tenant.tenantId };
        }
        catch (error) {
            return { success: false, message: error.message || 'Failed to create tenant' };
        }
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AgentController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('connections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Get)('invitation'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Post)('initialize'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize or get an agent for a tenant' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { tenantId: { type: 'string' } }, required: ['tenantId'] } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "initialize", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Validate tenant credentials' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { tenantId: { type: 'string' } }, required: ['tenantId'] } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('tenant'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant' }),
    (0, swagger_1.ApiBody)({ schema: { properties: { label: { type: 'string' } }, required: ['label'] } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "createTenant", null);
exports.AgentController = AgentController = AgentController_1 = __decorate([
    (0, swagger_1.ApiTags)('Agent'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('agent'),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map