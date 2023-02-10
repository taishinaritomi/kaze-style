import fs from 'fs';
import path from 'path';

type PackageJson = {
  name?: string;
  version?: string;
  sideEffects?: boolean;
};

export const getPackageJson = (): PackageJson => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = fs.readFileSync(packageJsonPath);
  return JSON.parse(packageJson.toString());
};
