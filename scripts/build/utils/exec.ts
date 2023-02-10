import childProcess from 'child_process';

export const exec = async (cmd: string) => {
  const spawnStream = childProcess.spawn(cmd, { shell: true });
  const stdout: string[] = [];
  const stderr: string[] = [];
  return await new Promise<string>((resolve, reject) => {
    spawnStream.stdout.on('data', (data) => {
      stdout.push(data.toString());
    });
    spawnStream.stderr.on('data', (data) => {
      stderr.push(data.toString());
    });
    spawnStream.on('close', (code) => {
      if (code === 0) resolve(stdout.join('').trim());
      else reject(new Error([...stdout, ...stderr].join('').trim()));
    });
  });
};
