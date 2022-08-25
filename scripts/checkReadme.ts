import { promises as fs } from 'fs';
import path from 'path';
import glob from 'fast-glob';

(async () => {
  const packages = await glob('packages/*', {
    onlyDirectories: true,
    absolute: true,
  });

  const primaryREADME = (
    await fs.readFile(path.join(__dirname, '../README.md'))
  ).toString();
  for (const packageDir of packages) {
    const packageREADME = (
      await fs.readFile(path.join(packageDir, 'README.md'))
    ).toString();
    if (packageREADME !== primaryREADME) {
      throw Error('README has not been copied.');
    }
  }
})();
