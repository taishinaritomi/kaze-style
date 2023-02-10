import type { Metafile } from 'esbuild';
import esbuild from 'esbuild';
import fs from 'fs-extra';
import { gzipSize } from 'gzip-size';
import { ENTRY_DIR, ESBUILD_OPTIONS, SIZE_OUT_DIR } from './constants';
import { formatBytes } from './utils/formatBytes';
import { logger } from './utils/logger';
import { timer } from './utils/timer';

export const bundleSize = async (entry: string[]) => {
  const stop = timer();
  entry.push(`${ENTRY_DIR}/index.ts`);
  try {
    await fs.remove(SIZE_OUT_DIR);
    const { metafile } = await esbuild.build({
      ...ESBUILD_OPTIONS,
      format: 'esm',
      entryPoints: entry,
      outdir: SIZE_OUT_DIR,
      bundle: true,
      metafile: true,
    });
    const report = await bundleSizeReport(metafile.outputs);
    await fs.outputJson(`${SIZE_OUT_DIR}/report.json`, report, { spaces: 2 });
    logger.success('BundleSize', SIZE_OUT_DIR, stop());
    return report;
  } catch {
    logger.error('BundleSize');
    process.exit(1);
  }
};

type Report = {
  size: string;
  size_byte: number;
  gzip: string;
  gzip_byte: number;
};

const bundleSizeReport = async (outputs: Metafile['outputs']) => {
  const report: Record<string, Report> = {};
  for (const file in outputs) {
    const output = outputs[file];
    const buffer = await fs.readFile(file);
    const code = buffer.toString();
    const sizeByte = Buffer.byteLength(code, 'utf8');
    if (output?.entryPoint) {
      report[output.entryPoint] = {
        size: formatBytes(sizeByte),
        size_byte: sizeByte,
        gzip: formatBytes(await gzipSize(code)),
        gzip_byte: await gzipSize(code),
      };
    }
  }
  return report;
};
