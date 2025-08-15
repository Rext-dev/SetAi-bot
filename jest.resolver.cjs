const path = require('path');
// Usar el defaultResolver expuesto por jest-resolve (API pública)
const { defaultResolver } = require('jest-resolve');

module.exports = (request, options) => {
  // Sólo tocar imports relativos que vengan de nuestros sources (fuera de node_modules)
  const basedir = options.basedir || '';
  const inNodeModules = basedir.includes(`${path.sep}node_modules${path.sep}`);

  if (!inNodeModules && request.startsWith('.') && request.endsWith('.js')) {
    const tsCandidate = request.replace(/\.js$/, '.ts');
    try {
      return defaultResolver(tsCandidate, options);
    } catch (_) {
      // Si no existe .ts, cae al default con el original
    }
  }
  return defaultResolver(request, options);
};
