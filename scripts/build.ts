import arg from 'arg';
import fs from 'fs-extra';
import { bundleSize } from './build/bundleSize';
import { cjsBuild } from './build/cjsBuild';
import { OUT_DIR } from './build/constants';
import { esmBuild } from './build/esmBuild';
import { execBuild } from './build/execBuild';
import { tsBuild } from './build/tsBuild';
import { getPackageJson } from './build/utils/getPackageJson';
import { logger } from './build/utils/logger';
import { timer } from './build/utils/timer';

const args = arg({
  '--cjsOnly': Boolean,
  '--watch': Boolean,
  '--size': Boolean,
  '--entry': [String],
  '--exec': String,
});

const watch = args['--watch'] || false;
const cjsOnly = args['--cjsOnly'] || false;
const isSize = args['--size'] || false;
const entry = args['--entry'] || [];
const execCommand = args['--exec'];

const build = async () => {
  const stop = timer();
  const packageJson = getPackageJson();
  const packageName = packageJson.name || 'unknown';
  const packageVersion = packageJson.version || '0.0.0';
  const sideEffects = packageJson.sideEffects;
  logger.info('Build', packageName, packageVersion);
  !watch && (await fs.remove(OUT_DIR));
  const [report] = await Promise.all([
    isSize && bundleSize(entry),
    !cjsOnly && esmBuild({ packageJson: { sideEffects }, watch }),
    cjsBuild({ packageJson: { sideEffects }, watch }),
    tsBuild({ watch }),
    execCommand && execBuild(execCommand),
  ]);
  if (report) console.table(report);
  logger.success('ALL', OUT_DIR, stop());
};

build();
