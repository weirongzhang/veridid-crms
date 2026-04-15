"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsKeyCorrectnessProofRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsKeyCorrectnessProofRecord extends core_1.BaseRecord {
    constructor(props) {
        super();
        this.type = AnonCredsKeyCorrectnessProofRecord.type;
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
exports.AnonCredsKeyCorrectnessProofRecord = AnonCredsKeyCorrectnessProofRecord;
AnonCredsKeyCorrectnessProofRecord.type = 'AnonCredsKeyCorrectnessProofRecord';
//# sourceMappingURL=AnonCredsKeyCorrectnessProofRecord.js.map