"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassValidationError = void 0;
const CredoError_1 = require("./CredoError");
class ClassValidationError extends CredoError_1.CredoError {
    validationErrorsToString() {
        return this.validationErrors?.map((error) => error.toString(true)).join('\n') ?? '';
    }
    constructor(message, { classType, cause, validationErrors }) {
        const validationErrorsStringified = validationErrors
            ?.map((error) => error.toString(undefined, undefined, undefined, true))
            .join('\n');
        super(`${classType}: ${message}
${validationErrorsStringified}`, { cause });
        this.validationErrors = validationErrors ?? [];
    }
}
exports.ClassValidationError = ClassValidationError;
//# sourceMappingURL=ClassValidationError.js.map