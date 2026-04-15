(function (factory) {
  if (typeof define === 'function' && define.amd)
    define(['exports'], factory);
  else if (typeof exports === 'object')
    factory(module.exports);
  else
    globalThis['cryptography-kotlin-cryptography-serialization-asn1-modules'] = factory(typeof globalThis['cryptography-kotlin-cryptography-serialization-asn1-modules'] === 'undefined' ? {} : globalThis['cryptography-kotlin-cryptography-serialization-asn1-modules']);
}(function (_) {
  'use strict';
  //region block: pre-declaration
  //endregion
  return _;
}));

//# sourceMappingURL=cryptography-kotlin-cryptography-serialization-asn1-modules.js.map
