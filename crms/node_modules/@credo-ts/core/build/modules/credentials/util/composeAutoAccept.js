"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeAutoAccept = composeAutoAccept;
const CredentialAutoAcceptType_1 = require("../models/CredentialAutoAcceptType");
/**
 * Returns the credential auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptCredential.Never} is returned
 */
function composeAutoAccept(recordConfig, agentConfig) {
    return recordConfig ?? agentConfig ?? CredentialAutoAcceptType_1.AutoAcceptCredential.Never;
}
//# sourceMappingURL=composeAutoAccept.js.map