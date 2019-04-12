const path = require('path');
const Listr = require('listr');
const tar = require('tar');
const chalk = require('chalk');

/**
 * @param {Object} settings
 * @return {Promise}
 */
function compress(settings) {
  return new Promise((mainResolve, mainReject) => {
    const archiveSuffix = (new Date()).toISOString().replace(/:/g, '.');
    settings.compressedRepositoryPath = path.join(
      settings.tempDir,
      `${settings.repositorySlug.replace(/\//g, '--')}__${archiveSuffix}.tar.gz`
    );

    new Listr([{
      title: `Compress cloned repository${settings.verbose ? ` '${settings.clonedRepositoryPath}'` : ''}`,
      task: () => new Listr([{
        title: chalk.dim('Compressing…'),
        task: (ctx, task) => new Promise((resolve) => {
          tar.create({ file: settings.compressedRepositoryPath }, [settings.clonedRepositoryPath])
            .then(() => {
              if (settings.verbose) {
                task.title = chalk.dim(`Compressed to '${settings.compressedRepositoryPath}'`);
              }

              resolve();
              mainResolve();
            })
            .catch((err) => {
              console.error('compress - failed to compress repository: ', err);
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

module.exports = compress;
