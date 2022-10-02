import { URLSearchParams } from 'url';
import type { LoaderContext } from 'webpack';

function virtualLoader(this: LoaderContext<unknown>): string {
  const query = new URLSearchParams(this.resourceQuery);
  return query.get('style') || '';
}

export default virtualLoader;
