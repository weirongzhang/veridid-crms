"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getThreadIdFromPlainTextMessage = getThreadIdFromPlainTextMessage;
function getThreadIdFromPlainTextMessage(message) {
    return message['~thread']?.thid ?? message['@id'];
}
//# sourceMappingURL=thread.js.map