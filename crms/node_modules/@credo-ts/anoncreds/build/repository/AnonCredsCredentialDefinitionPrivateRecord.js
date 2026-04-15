"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialDefinitionPrivateRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsCredentialDefinitionPrivateRecord extends core_1.BaseRecord {
    constructor(props) {
        super();
        this.type = AnonCredsCredentialDefinitionPrivateRecord.type;
        if (props) {
            this.id = props.id ?? core_1.utils.uuid();
            this.credentialDefinitionId = props.credentialDefinitionId;
            this.value = props.value;
            this.createdAt = props.createdAt ?? new Date();
        }
    }
    getTags() {
        return {
            ...this._tags,
            credentialDefinitionId: this.credentialDefinitionId,
        };
    }
}
exports.AnonCredsCredentialDefinitionPrivateRecord = AnonCredsCredentialDefinitionPrivateRecord;
AnonCredsCredentialDefinitionPrivateRecord.type = 'AnonCredsCredentialDefinitionPrivateRecord';
//# sourceMappingURL=AnonCredsCredentialDefinitionPrivateRecord.js.map