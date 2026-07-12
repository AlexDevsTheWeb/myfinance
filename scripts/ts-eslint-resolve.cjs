const Module = require('module');
const origResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, ...args) {
  if (
    request === 'typescript' &&
    parent &&
    typeof parent.filename === 'string' &&
    (parent.filename.includes('@typescript-eslint') ||
      parent.filename.includes('ts-api-utils'))
  ) {
    return origResolve.call(this, '@typescript/typescript6', parent, ...args);
  }
  return origResolve.call(this, request, parent, ...args);
};
