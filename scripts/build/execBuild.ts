import { exec } from './utils/exec';
import { logger } from './utils/logger';
import { timer } from './utils/timer';

export const execBuild = async (execCommand: string) => {
  const stop = timer();
  try {
    const stdout = await exec(execCommand);
    logger.success(`${execCommand}`, '', stop());
    stdout && console.log(stdout);
  } catch (error) {
    logger.error(`${execCommand}`);
    if (error instanceof Error) console.log(error.message);
    process.exit(1);
  }
};
