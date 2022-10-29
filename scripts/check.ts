import { promises as fs } from 'fs';
import path from 'path';
import arg from 'arg';
import glob from 'glob';

const args = arg({
  '--file': String,
});

const file = args['--file'] || 'README.md';

(async () => {
  const packages = glob.sync('packages/*/', { absolute: true });
  const primary = (
    await fs.readFile(path.join(process.cwd(), file))
  ).toString();
  for (const packageDir of packages) {
    const packageREADME = (
      await fs.readFile(path.join(packageDir, file))
    ).toString();
    if (packageREADME !== primary) {
      throw new Error('README has not been copied.');
    }
  }
})();
