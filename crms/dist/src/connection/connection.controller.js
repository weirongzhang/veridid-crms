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
var ConnectionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const connection_service_1 = require("./connection.service");
let ConnectionController = ConnectionController_1 = class ConnectionController {
    connectionService;
    logger = new common_1.Logger(ConnectionController_1.name);
    constructor(connectionService) {
        this.connectionService = connectionService;
    }
    async getAll(user) {
        this.logger.log(`GET /connections - tenant: ${user.tenantId}`);
        const result = await this.connectionService.getAll(user.tenantId);
        return { success: true, ...result };
    }
    async getMessages(user, connectionId) {
        this.logger.log(`GET /connections/messages/${connectionId} - tenant: ${user.tenantId}`);
        const messages = await this.connectionService.getMessages(user.tenantId, connectionId);
        return { success: true, messages };
    }
    async getById(user, connectionId) {
        this.logger.log(`GET /connections/${connectionId} - tenant: ${user.tenantId}`);
        const connection = await this.connectionService.getById(user.tenantId, connectionId);
        if (!connection) {
            throw new common_1.NotFoundException(`Connection ${connectionId} not found`);
        }
        return {
            success: true,
            connection: {
                id: connection.id,
                createdAt: connection.createdAt,
                state: connection.state,
                role: connection.role,
                theirLabel: connection.theirLabel,
                theirDid: connection.theirDid,
                threadId: connection.threadId,
                autoAcceptConnection: connection.autoAcceptConnection,
            },
        };
    }
    async createInvitation(user, body) {
        this.logger.log(`POST /connections/invitation - tenant: ${user.tenantId}`);
        const invitation = await this.connectionService.createInvitation(user.tenantId, body?.label);
        return { success: true, invitation };
    }
    async receiveInvitation(user, body) {
        this.logger.log(`POST /connections/receive-invitation - tenant: ${user.tenantId}`);
        const { connectionRecord } = await this.connectionService.receiveInvitation(user.tenantId, body.invitationUrl);
        if (!connectionRecord) {
            return { success: false, message: 'Failed to create connection from invitation' };
        }
        return {
            success: true,
            connection: {
                id: connectionRecord.id,
                state: connectionRecord.state,
                role: connectionRecord.role,
                theirLabel: connectionRecord.theirLabel,
                createdAt: connectionRecord.createdAt,
            },
        };
    }
    async sendMessage(user, body) {
        this.logger.log(`POST /connections/message - tenant: ${user.tenantId}`);
        const m = await this.connectionService.sendMessage(user.tenantId, body.connectionId, body.message);
        return { success: true, message: m };
    }
};
exports.ConnectionController = ConnectionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all connections and pending invitations' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('messages/:connectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get basic messages for a connection' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)(':connectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a connection by ID' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)('invitation'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new OOB invitation' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Post)('receive-invitation'),
    (0, swagger_1.ApiOperation)({ summary: 'Receive an invitation from a URL and establish a connection' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "receiveInvitation", null);
__decorate([
    (0, common_1.Post)('message'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a basic message to a connection' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ConnectionController.prototype, "sendMessage", null);
exports.ConnectionController = ConnectionController = ConnectionController_1 = __decorate([
    (0, swagger_1.ApiTags)('Connections'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('connections'),
    __metadata("design:paramtypes", [connection_service_1.ConnectionService])
], ConnectionController);
//# sourceMappingURL=connection.controller.js.map