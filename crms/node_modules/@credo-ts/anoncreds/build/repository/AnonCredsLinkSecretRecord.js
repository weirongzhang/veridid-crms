"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsLinkSecretRecord = void 0;
const core_1 = require("@credo-ts/core");
class AnonCredsLinkSecretRecord extends core_1.BaseRecord {
    constructor(props) {
        super();
        this.type = AnonCredsLinkSecretRecord.type;
        if (props) {
            this.id = props.id ?? core_1.utils.uuid();
            this.linkSecretId = props.linkSecretId;
            this.value = props.value;
        }
    }
    getTags() {
        return {
            ...this._tags,
            linkSecretId: this.linkSecretId,
        };
    }
}
exports.AnonCredsLinkSecretRecord = AnonCredsLinkSecretRecord;
AnonCredsLinkSecretRecord.type = 'AnonCredsLinkSecretRecord';
//# sourceMappingURL=AnonCredsLinkSecretRecord.js.map