"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.W3cCredentialsModuleConfig = void 0;
const documentLoader_1 = require("./data-integrity/libraries/documentLoader");
class W3cCredentialsModuleConfig {
    constructor(options) {
        this.options = options ?? {};
    }
    /** See {@link W3cCredentialsModuleConfigOptions.documentLoader} */
    get documentLoader() {
        return this.options.documentLoader ?? documentLoader_1.defaultDocumentLoader;
    }
}
exports.W3cCredentialsModuleConfig = W3cCredentialsModuleConfig;
//# sourceMappingURL=W3cCredentialsModuleConfig.js.map