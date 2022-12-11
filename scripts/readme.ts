import { promises as fs } from 'fs';
import path from 'path';
import arg from 'arg';
import glob from 'glob';
import pc from 'picocolors';

const args = arg({});

const operation = args._[0];
const file = args._[1] || 'README.md';

const main = async () => {
  const packages = glob.sync('packages/*/');
  const primaryPath = path.join(process.cwd(), file);
  let errCount = 0;
  if (operation === 'copy') {
    for (const packageDir of packages) {
      try {
        await fs.copyFile(primaryPath, path.join(packageDir, file));
        console.log(pc.green(`✅ ${packageDir}`));
      } catch (_) {
        console.log(pc.red(`❌ ${packageDir}`));
        errCount++;
      }
    }
    if (errCount !== 0) process.exit(1);
  } else if (operation === 'check') {
    const primaryFile = await fs.readFile(primaryPath);
    for (const packageDir of packages) {
      const packageFile = await fs.readFile(path.join(packageDir, file));
      if (packageFile.toString() === primaryFile.toString()) {
        console.log(pc.green(`✅ ${packageDir}`));
      } else {
        console.log(pc.red(`❌ ${packageDir}`));
        errCount++;
      }
    }
    if (errCount !== 0) process.exit(1);
  } else process.exit(1);
};

main();
