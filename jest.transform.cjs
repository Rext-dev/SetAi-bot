const { transformSync } = require('esbuild');

module.exports = {
  process(src, filename) {
    if (/\.ts$/.test(filename)) {
      const result = transformSync(src, {
        loader: 'ts',
        format: 'esm',
        target: 'es2022',
        sourcemap: 'inline'
      });
      return { code: result.code, map: result.map };
    }
    return { code: src };
  }
};
