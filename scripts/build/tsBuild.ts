import fs from "fs-extra";
import { TYPES_OUT_DIR } from "./constants";
import { exec } from "./utils/exec";
import { logger } from "./utils/logger";
import { timer } from "./utils/timer";

type Options = {
  watch: boolean;
}

export const tsBuild = async (options: Options) => {
  const stop = timer();
  try {
    const packageJson = { type: 'commonjs' };
    const [stdout] = await Promise.all([
      exec(
        `tsc ${
          options.watch ? '-w' : ''
        } --declaration --emitDeclarationOnly --outDir ${TYPES_OUT_DIR} -p tsconfig.build.json`,
      ),
      fs.outputJson(`${TYPES_OUT_DIR}/package.json`, packageJson),
    ]);
    logger.success('TypeScript', TYPES_OUT_DIR, stop());
    stdout && console.log(stdout);
  } catch (error) {
    logger.error('TypeScript');
    if (error instanceof Error) console.log(error.message);
    process.exit(1);
  }
};
