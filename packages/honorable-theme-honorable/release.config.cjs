/* eslint-disable */

const name = 'honorable-theme-honorable';
// const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

module.exports = {
  extends: `${pathToRepoRoot}/release.config.base.cjs`,
//   pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    // REMOVING external dependencies to decrease unneeded releases and bad change logs
    // `${pathToRepoRoot}/workspace.json`,
    // `${pathToRepoRoot}/nx.json`,
    // `${pathToRepoRoot}/.nxignore`,
    // `${pathToRepoRoot}/package.json`,
    // `${pathToRepoRoot}/.prettierrc`,
    // `${pathToRepoRoot}/.prettierignore`,
    `*`, // anything in this directory
  ],
};
