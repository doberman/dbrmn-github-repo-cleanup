const fs = require('fs');
const Listr = require('listr');
const nodegit = require('nodegit');
const rimraf = require('rimraf');
const chalk = require('chalk');

/**
 * @param {Object} settings
 * @return {Promise}
 */
function clone(settings) {
  return new Promise((mainResolve, mainReject) => {
    new Listr([{
      title: 'Clone repository',
      task: () => new Listr([{
        title: `Cloning ${settings.repositoryUrl}' ${settings.verbose ? ` to '${settings.clonedRepositoryPath}'` : ''}`,
        task: (ctx, task) => new Promise((resolve) => {
          if (fs.existsSync(settings.clonedRepositoryPath)) {
            rimraf.sync(settings.clonedRepositoryPath);
          }

          const cloneOpts = {
            fetchOpts: {
              callbacks: {
                certificateCheck: () => 1,
                credentials: (url, username) => nodegit.Cred.sshKeyFromAgent(username)
              }
            },
          };

          // clone repository
          nodegit.Clone(settings.repositoryUrl, settings.clonedRepositoryPath, cloneOpts)
            .then(() => {
              if (settings.verbose) {
                task.title = chalk.dim(`Repository '${settings.repositorySlug}' cloned to '${settings.clonedRepositoryPath}'`);
              } else {
                task.title = chalk.dim(task.title);
              }

              resolve();
              mainResolve();
            }).catch((err) => {
              console.error('clone - failed to clone repository: ', err.message);
              mainReject(err);
            });
        })
      }])
    }], {
      collapse: false
    })
    .run().catch(mainReject);
  });
}

module.exports = clone;
