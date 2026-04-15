"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRevocationRegistryDefinitionRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsRevocationRegistryDefinitionRecord extends core_1.BaseRecord {
    constructor(props) {
        super();
        this.type = AnonCredsRevocationRegistryDefinitionRecord.type;
        if (props) {
            this.id = props.id ?? core_1.utils.uuid();
            this.revocationRegistryDefinitionId = props.revocationRegistryDefinitionId;
            this.revocationRegistryDefinition = props.revocationRegistryDefinition;
            this.createdAt = props.createdAt ?? new Date();
        }
    }
    getTags() {
        return {
            ...this._tags,
            revocationRegistryDefinitionId: this.revocationRegistryDefinitionId,
            credentialDefinitionId: this.revocationRegistryDefinition.credDefId,
        };
    }
}
exports.AnonCredsRevocationRegistryDefinitionRecord = AnonCredsRevocationRegistryDefinitionRecord;
AnonCredsRevocationRegistryDefinitionRecord.type = 'AnonCredsRevocationRegistryDefinitionRecord';
//# sourceMappingURL=AnonCredsRevocationRegistryDefinitionRecord.js.map