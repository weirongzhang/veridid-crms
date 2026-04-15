"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericRecord = void 0;
const BaseRecord_1 = require("../../../storage/BaseRecord");
const uuid_1 = require("../../../utils/uuid");
class GenericRecord extends BaseRecord_1.BaseRecord {
    constructor(props) {
        super();
        this.type = GenericRecord.type;
        if (props) {
            this.id = props.id ?? (0, uuid_1.uuid)();
            this.createdAt = props.createdAt ?? new Date();
            this.content = props.content;
            this._tags = props.tags ?? {};
        }
    }
    getTags() {
        return {
            ...this._tags,
        };
    }
}
exports.GenericRecord = GenericRecord;
GenericRecord.type = 'GenericRecord';
//# sourceMappingURL=GenericRecord.js.map