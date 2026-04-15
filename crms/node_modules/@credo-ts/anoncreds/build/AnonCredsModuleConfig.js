"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsModuleConfig = void 0;
const tails_1 = require("./services/tails");
/**
 * @public
 */
class AnonCredsModuleConfig {
    constructor(options) {
        this.options = options;
    }
    /** See {@link AnonCredsModuleConfigOptions.registries} */
    get registries() {
        return this.options.registries;
    }
    /** See {@link AnonCredsModuleConfigOptions.tailsFileService} */
    get tailsFileService() {
        return this.options.tailsFileService ?? new tails_1.BasicTailsFileService();
    }
    get anoncreds() {
        return this.options.anoncreds;
    }
    /** See {@link AnonCredsModuleConfigOptions.autoCreateLinkSecret} */
    get autoCreateLinkSecret() {
        return this.options.autoCreateLinkSecret ?? true;
    }
}
exports.AnonCredsModuleConfig = AnonCredsModuleConfig;
//# sourceMappingURL=AnonCredsModuleConfig.js.map