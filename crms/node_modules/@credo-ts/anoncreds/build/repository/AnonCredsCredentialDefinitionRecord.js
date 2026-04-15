"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialDefinitionRecord = void 0;
const core_1 = require("@credo-ts/core");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
class AnonCredsCredentialDefinitionRecord extends core_1.BaseRecord {
    constructor(props) {
        super();
        this.type = AnonCredsCredentialDefinitionRecord.type;
        if (props) {
            this.id = props.id ?? core_1.utils.uuid();
            this.createdAt = props.createdAt ?? new Date();
            this.credentialDefinitionId = props.credentialDefinitionId;
            this.credentialDefinition = props.credentialDefinition;
            this.methodName = props.methodName;
        }
    }
    getTags() {
        let unqualifiedCredentialDefinitionId = undefined;
        if ((0, indyIdentifiers_1.isDidIndyCredentialDefinitionId)(this.credentialDefinitionId)) {
            const { namespaceIdentifier, schemaSeqNo, tag } = (0, indyIdentifiers_1.parseIndyCredentialDefinitionId)(this.credentialDefinitionId);
            unqualifiedCredentialDefinitionId = (0, indyIdentifiers_1.getUnqualifiedCredentialDefinitionId)(namespaceIdentifier, schemaSeqNo, tag);
        }
        return {
            ...this._tags,
            credentialDefinitionId: this.credentialDefinitionId,
            schemaId: this.credentialDefinition.schemaId,
            issuerId: this.credentialDefinition.issuerId,
            tag: this.credentialDefinition.tag,
            methodName: this.methodName,
            unqualifiedCredentialDefinitionId,
        };
    }
}
exports.AnonCredsCredentialDefinitionRecord = AnonCredsCredentialDefinitionRecord;
AnonCredsCredentialDefinitionRecord.type = 'AnonCredsCredentialDefinitionRecord';
//# sourceMappingURL=AnonCredsCredentialDefinitionRecord.js.map