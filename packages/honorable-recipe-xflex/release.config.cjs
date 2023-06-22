/* eslint-disable */

const name = 'honorable-recipe-xflex';
const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

module.exports = {
  extends: `${pathToRepoRoot}/release.config.base.cjs`,
//   pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    `${srcRoot}/*`,
  ],
};
