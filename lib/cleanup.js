const fs = require('fs');
const Listr = require('listr');
const chalk = require('chalk');
const rimraf = require('rimraf');

/**
 * @param {Object} settings
 * @return {Promise}
 */
function cleanUp(settings) {
  return new Promise((mainResolve, mainReject) => {
    if (!settings || typeof(settings) !== 'object') {
      return mainReject(new Error('Invalid settings'));
    }

    new Listr([{
      title: 'Clean up',
      task: () => new Listr([{
        title: chalk.dim(`Removing local repository clone directory${settings.verbose ? ` '${settings.clonedRepositoryPath}'` : ''}`),
        task: () => new Promise((resolve) => {
          if (fs.existsSync(settings.clonedRepositoryPath)) {
            rimraf(settings.clonedRepositoryPath, () => {
              resolve();
              mainResolve();
            })
          } else {
            resolve();
            mainResolve();
          }
        })
      }, {
        title: chalk.dim(`Removing local compressed repository${settings.verbose ? ` '${settings.compressedRepositoryPath}'` : ''}`),
        task: () => new Promise((resolve) => {
          if (fs.existsSync(settings.compressedRepositoryPath)) {
            rimraf(settings.compressedRepositoryPath, resolve);
          } else {
            resolve();
            mainResolve();
          }
        })
      }])
    }], {
      collapse: false
    })
    .run().catch(mainReject);
  });
}

async function cleanUpAndExit(exitCode=0) {
  try {
    await cleanUp();
    process.exit(exitCode);
  } catch (e) {
    process.exit(1);
  }
}

module.exports = {
  cleanUp,
  cleanUpAndExit
};
