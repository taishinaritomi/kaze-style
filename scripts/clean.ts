import { rimraf } from 'rimraf';

const clean = async () => {
  await rimraf(
    [
      './{playground,packages}/**/.swc',
      './{playground,packages}/**/dist*',
      './{playground,packages}/**/.turbo',
      './{playground,packages}/**/target',
      './{playground,packages}/**/node_modules',
      './node_modules',
      './.swc',
    ],
    { glob: true },
  );
};

clean();
