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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSeedDidDto = exports.CreateDidDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateDidDto {
    method;
    keyType;
}
exports.CreateDidDto = CreateDidDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'DID method to use',
        enum: ['indy', 'key', 'peer'],
        example: 'indy',
    }),
    __metadata("design:type", String)
], CreateDidDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Key type for did:key (ignored for indy/peer)',
        enum: ['ed25519', 'p256'],
        example: 'ed25519',
    }),
    __metadata("design:type", String)
], CreateDidDto.prototype, "keyType", void 0);
class ImportSeedDidDto {
    seed;
    verkey;
    did;
    indyNamespace;
}
exports.ImportSeedDidDto = ImportSeedDidDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '32-byte seed used to register the DID on the ledger',
        example: '12345678901234567890123456789028',
    }),
    __metadata("design:type", String)
], ImportSeedDidDto.prototype, "seed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base58 verkey shown on the genesis registration page',
        example: 'CJFQov22XwHpTSxWHHo5As6Uy2XfgHi43JaAQuNJDzho',
    }),
    __metadata("design:type", String)
], ImportSeedDidDto.prototype, "verkey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Short (unqualified) DID shown on the genesis registration page',
        example: 'MjDWrAigEsSwdEod69bCHV',
    }),
    __metadata("design:type", String)
], ImportSeedDidDto.prototype, "did", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Indy namespace of the ledger (default: digicred:test)',
        example: 'digicred:test',
    }),
    __metadata("design:type", String)
], ImportSeedDidDto.prototype, "indyNamespace", void 0);
//# sourceMappingURL=did.dto.js.map