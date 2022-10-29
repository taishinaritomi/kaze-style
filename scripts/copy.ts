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
  for (const packageDir of packages) {
    await fs.copyFile(
      path.join(path.join(process.cwd(), file)),
      path.join(packageDir, file),
    );
  }
})();
