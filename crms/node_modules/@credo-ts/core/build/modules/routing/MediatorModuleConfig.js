"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediatorModuleConfig = void 0;
const MessageForwardingStrategy_1 = require("./MessageForwardingStrategy");
class MediatorModuleConfig {
    constructor(options) {
        this.options = options ?? {};
    }
    /** See {@link MediatorModuleConfigOptions.autoAcceptMediationRequests} */
    get autoAcceptMediationRequests() {
        return this.options.autoAcceptMediationRequests ?? false;
    }
    /** See {@link MediatorModuleConfigOptions.messageForwardingStrategy} */
    get messageForwardingStrategy() {
        return this.options.messageForwardingStrategy ?? MessageForwardingStrategy_1.MessageForwardingStrategy.DirectDelivery;
    }
}
exports.MediatorModuleConfig = MediatorModuleConfig;
//# sourceMappingURL=MediatorModuleConfig.js.map