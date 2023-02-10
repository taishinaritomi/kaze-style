import pc from 'picocolors';

export const logger = {
  info: (operation: string, name: string, version: string) => {
    console.log(
      '🟢',
      pc.bold(pc.blue(operation)),
      pc.bold(pc.cyan(name)),
      pc.bold(pc.gray(version)),
    );
  },
  success: (operation: string, outDir: string, time: number) => {
    console.log(
      '🟢',
      pc.bold(pc.green(operation)),
      pc.bold(pc.gray(outDir)),
      pc.bold(pc.yellow(`${time}ms`)),
    );
  },
  error: (operation: string) => {
    console.log('🔴', pc.bold(pc.red(operation)));
  },
};
