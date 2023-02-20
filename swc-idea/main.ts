import { transform } from '@swc/core';
import { suite, add, cycle, complete } from 'benny';

const src = `
import { target,gTarget, target as _target } from 'target_source';
import * as targetNamespace from 'target_source';
console.log(target())
const c = target();
gTarget();
console.log(targetNamespace.target())
console.log(_target())
console.log(target())
console.log(targetNamespace.target())
console.log(_target())
`;

suite(
  'Benchmark',
  add('transform new', async () => {
    await transform(src, {
      filename: 'filename.ts',
      swcrc: false,
      jsc: {
        target: 'esnext',
        // syntax: 'typescript',
        // tsx: true,
        experimental: {
          plugins: [
            ['swc-plugin', {
              "transforms": [
                {
                  "source": "target_source",
                  "from": "target",
                  "pre": "__preTarget",
                  "to": "__target"
                },
                {
                  "source": "target_source",
                  "from": "gTarget",
                  "pre": "__preGTarget",
                  "to": "__gTarget"
                },
              ],
              "buildArg": {
                "type": "Object",
                "properties": [
                  {
                    "key": "filename",
                    "value": {
                      "type": "String",
                      "value": "filename.ts"
                    },
                  },
                  {
                    "key": "build",
                    "value": {
                      "type": "Identifier",
                      "name": "for_build"
                    },
                  }
                ],
              },
              "collector": {
                "exportName": "__collector",
                "specifier": "collector",
              },
              "imports": []
          }],
          ],
        },
      },
    })
  }),
  cycle(),
  complete(),
);

(async () => {
  const result = await transform(src, {
    filename: 'filename.ts',
    swcrc: false,
    jsc: {
      target: 'esnext',
      // syntax: 'typescript',
      // tsx: true,
      experimental: {
        plugins: [
          ['swc-plugin', {
            "transforms": [
              {
                "source": "target_source",
                "from": "target",
                "pre": "__preTarget",
                "to": "__target"
              },
              {
                "source": "target_source",
                "from": "gTarget",
                "pre": "__preGTarget",
                "to": "__gTarget"
              },
            ],
            "buildArg": {
              "type": "Object",
              "properties": [
                {
                  "key": "filename",
                  "value": {
                    "type": "String",
                    "value": "filename.ts"
                  },
                },
                {
                  "key": "build",
                  "value": {
                    "type": "Identifier",
                    "name": "for_build"
                  },
                }
              ],
            },
            "collector": {
              "exportName": "__collector",
              "specifier": "collector",
            },
            "imports": []
        }],
        ],
      },
    },
  })
  console.log(result.code);
})();
