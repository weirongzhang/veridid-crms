(function (factory) {
  if (typeof define === 'function' && define.amd)
    define(['exports'], factory);
  else if (typeof exports === 'object')
    factory(module.exports);
  else
    globalThis['cryptography-kotlin-cryptography-bigint'] = factory(typeof globalThis['cryptography-kotlin-cryptography-bigint'] === 'undefined' ? {} : globalThis['cryptography-kotlin-cryptography-bigint']);
}(function (_) {
  'use strict';
  //region block: pre-declaration
  //endregion
  return _;
}));

//# sourceMappingURL=cryptography-kotlin-cryptography-bigint.js.map
