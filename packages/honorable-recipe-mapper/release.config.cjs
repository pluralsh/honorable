/* eslint-disable */

const name = 'honorable-recipe-mapper';
// const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

module.exports = {
  extends: `${pathToRepoRoot}/release.config.base.cjs`,
  // pkgRoot: `dist`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    `*`,
  ],
};