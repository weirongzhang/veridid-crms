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
exports.CreateCredentialDefinitionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateCredentialDefinitionDto {
    schemaId;
    tag;
    supportRevocation;
}
exports.CreateCredentialDefinitionDto = CreateCredentialDefinitionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full AnonCreds schema ID (e.g. did:indy:digicred:test:<issuerDID>/anoncreds/v0/SCHEMA/<name>/<version>)',
        example: 'did:indy:digicred:test:2WJ58wm9K8psQSDBW8VotA/anoncreds/v0/SCHEMA/MySchema/1.0',
    }),
    __metadata("design:type", String)
], CreateCredentialDefinitionDto.prototype, "schemaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tag to distinguish multiple credential definitions for the same schema',
        example: 'default',
    }),
    __metadata("design:type", String)
], CreateCredentialDefinitionDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to enable credential revocation support',
        default: false,
    }),
    __metadata("design:type", Boolean)
], CreateCredentialDefinitionDto.prototype, "supportRevocation", void 0);
//# sourceMappingURL=credential-definition.dto.js.map