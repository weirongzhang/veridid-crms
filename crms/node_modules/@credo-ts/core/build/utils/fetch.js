"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = fetchWithTimeout;
async function fetchWithTimeout(fetch, url, init) {
    const abortController = new AbortController();
    const timeoutMs = init?.timeoutMs ?? 5000;
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);
    try {
        return await fetch(url, {
            ...init,
            signal: abortController.signal,
        });
    }
    finally {
        clearTimeout(timeout);
    }
}
//# sourceMappingURL=fetch.js.map