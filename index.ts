import { transform as bTransform } from '@babel/core';
import { preTransformPlugin } from '@kaze-style/babel-plugin';
import { transform as sTransform } from '@swc/core';
import b from 'benny';

const src = `
import { createStyle, createGlobalStyle, mergeStyle } from '@kaze-style/react';
import type { ComponentProps, FC } from 'react';

createGlobalStyle({
  html: {
    color:'red',
  }
})

const classes = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});

const classes2 = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});

const classes3 = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});

const classes4 = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});

const fn = () => {
  // const createStyle = () => {};
  const c = createStyle({});
}
`;

const swcTransform = async (src: string) => {
  return await sTransform(src, {
    filename: 'input.ts',
    swcrc: false,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
      experimental: {
        plugins: [
          [
            '@kaze-style/swc-plugin/_pre-transform',
            { filename: './dddd.ts', for_build_name: '__forBuildByKazeStyle' },
          ],
        ],
      },
    },
  });
};

const babelTransform = async (src: string) => {
  return await bTransform(src, {
    filename: 'input.ts',
    babelrc: false,
    plugins: [
      ['@babel/plugin-syntax-typescript', { isTSX: true }],
      [
        preTransformPlugin,
        { filename: './dddd.ts', forBuildName: '__forBuildByKazeStyle' },
      ],
    ],
  });
};

const main = async () => {
  console.log(await (await swcTransform(src)).code);
  console.log(await (await babelTransform(src))?.code);
};
main();

b.suite(
  'babel vs swc',

  b.add('swc plugin', async () => {
    await swcTransform(src);
  }),

  b.add('babel plugin', async () => {
    await babelTransform(src);
  }),

  b.cycle(),
  b.complete(),
);
