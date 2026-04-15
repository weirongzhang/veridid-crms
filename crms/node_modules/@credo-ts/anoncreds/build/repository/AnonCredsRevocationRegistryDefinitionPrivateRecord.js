"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsRevocationRegistryDefinitionPrivateRecord = exports.AnonCredsRevocationRegistryState = void 0;
const core_1 = require("@credo-ts/core");
var AnonCredsRevocationRegistryState;
(function (AnonCredsRevocationRegistryState) {
    AnonCredsRevocationRegistryState["Created"] = "created";
    AnonCredsRevocationRegistryState["Active"] = "active";
    AnonCredsRevocationRegistryState["Full"] = "full";
})(AnonCredsRevocationRegistryState || (exports.AnonCredsRevocationRegistryState = AnonCredsRevocationRegistryState = {}));
class AnonCredsRevocationRegistryDefinitionPrivateRecord extends core_1.BaseRecord {
    constructor(props) {
        super();
        this.type = AnonCredsRevocationRegistryDefinitionPrivateRecord.type;
        if (props) {
            this.id = props.id ?? core_1.utils.uuid();
            this.revocationRegistryDefinitionId = props.revocationRegistryDefinitionId;
            this.credentialDefinitionId = props.credentialDefinitionId;
            this.value = props.value;
            this.state = props.state ?? AnonCredsRevocationRegistryState.Created;
        }
    }
    getTags() {
        return {
            ...this._tags,
            revocationRegistryDefinitionId: this.revocationRegistryDefinitionId,
            credentialDefinitionId: this.credentialDefinitionId,
            state: this.state,
        };
    }
}
exports.AnonCredsRevocationRegistryDefinitionPrivateRecord = AnonCredsRevocationRegistryDefinitionPrivateRecord;
AnonCredsRevocationRegistryDefinitionPrivateRecord.type = 'AnonCredsRevocationRegistryDefinitionPrivateRecord';
//# sourceMappingURL=AnonCredsRevocationRegistryDefinitionPrivateRecord.js.map