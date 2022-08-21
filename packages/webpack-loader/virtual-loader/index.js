const { URLSearchParams } = require('url');

/**
 * @this {import('webpack').LoaderContext<unknown>}
 * @return {String}
 */
function virtualLoader() {
  const query = new URLSearchParams(this.resourceQuery);
  return query.get('style') || '';
}

module.exports = virtualLoader;
