"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediationRecipientModuleConfig = void 0;
class MediationRecipientModuleConfig {
    constructor(options) {
        this.options = options ?? {};
    }
    /** See {@link MediationRecipientModuleConfigOptions.mediatorPollingInterval} */
    get mediatorPollingInterval() {
        return this.options.mediatorPollingInterval ?? 5000;
    }
    /** See {@link MediationRecipientModuleConfigOptions.mediatorPickupStrategy} */
    get mediatorPickupStrategy() {
        return this.options.mediatorPickupStrategy;
    }
    /** See {@link MediationRecipientModuleConfigOptions.maximumMessagePickup} */
    get maximumMessagePickup() {
        return this.options.maximumMessagePickup ?? 10;
    }
    /** See {@link MediationRecipientModuleConfigOptions.baseMediatorReconnectionIntervalMs} */
    get baseMediatorReconnectionIntervalMs() {
        return this.options.baseMediatorReconnectionIntervalMs ?? 100;
    }
    /** See {@link MediationRecipientModuleConfigOptions.maximumMediatorReconnectionIntervalMs} */
    get maximumMediatorReconnectionIntervalMs() {
        return this.options.maximumMediatorReconnectionIntervalMs ?? Number.POSITIVE_INFINITY;
    }
    /** See {@link MediationRecipientModuleConfigOptions.mediatorInvitationUrl} */
    get mediatorInvitationUrl() {
        return this.options.mediatorInvitationUrl;
    }
}
exports.MediationRecipientModuleConfig = MediationRecipientModuleConfig;
//# sourceMappingURL=MediationRecipientModuleConfig.js.map