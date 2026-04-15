"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoverFeaturesModuleConfig = void 0;
class DiscoverFeaturesModuleConfig {
    constructor(options) {
        this.options = options ?? {};
    }
    /** {@inheritDoc DiscoverFeaturesModuleConfigOptions.autoAcceptQueries} */
    get autoAcceptQueries() {
        return this.options.autoAcceptQueries ?? true;
    }
}
exports.DiscoverFeaturesModuleConfig = DiscoverFeaturesModuleConfig;
//# sourceMappingURL=DiscoverFeaturesModuleConfig.js.map