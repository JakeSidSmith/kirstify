import { Config } from '@jakesidsmith/tsb';

const config: Config = {
  main: 'src/index.tsx',
  outDir: 'build',
  indexHTMLPath: 'src/index.html',
  tsconfigPath: 'tsconfig.json',
  clearOutDirBefore: ['build'],
  singlePageApp: false,
};

export default config;
