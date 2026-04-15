"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeAutoAccept = composeAutoAccept;
const models_1 = require("../models");
/**
 * Returns the proof auto accept config based on priority:
 *	- The record config takes first priority
 *	- Otherwise the agent config
 *	- Otherwise {@link AutoAcceptProof.Never} is returned
 */
function composeAutoAccept(recordConfig, agentConfig) {
    return recordConfig ?? agentConfig ?? models_1.AutoAcceptProof.Never;
}
//# sourceMappingURL=composeAutoAccept.js.map