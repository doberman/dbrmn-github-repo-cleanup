const fs = require('fs');
const path = require('path');
const Dropbox = require('dropbox');
const Listr = require('listr');
const chalk = require('chalk');

/**
 * @param {Object} settings
 * @return {Promise}
 */
function uploadToDropbox(settings) {
  const filename = path.basename(settings.compressedRepositoryPath);
  const fileContents = fs.readFileSync(settings.compressedRepositoryPath);

  return new Promise((mainResolve, mainReject) => {
    new Listr([{
      title: 'Upload to Dropbox',
      task: () => new Listr([{
        title: chalk.dim(`Uploading '${settings.compressedRepositoryPath}' to Dropbox...`),
        task: (ctx, task) => new Promise((resolve, reject) => {
          if (!settings.dropboxAccessToken) {
            return reject(new Error('Invalid Dropbox access token'));
          }

          const dropboxClient = new Dropbox({
            accessToken: settings.dropboxAccessToken
          });

          dropboxClient.filesUpload({ path: `/${filename}`, contents: fileContents })
            .then(() => {
              task.title = chalk.dim(`Successfully uploaded${settings.verbose ? ` '${settings.compressedRepositoryPath}'` : ''}`);
              resolve();
              mainResolve();
            })
            .catch((err) => {
              console.error(
                `Failed to upload '${settings.compressedRepositoryPath}' to Dropbox:`,
                `${err.response.res.statusMessage} (HTTP ${err.response.res.statusCode})`
              );
              console.log(`\nI've left the cloned repository and archive intact so you can inspect it at '${settings.tempDir}'.`);

              /**
               * Intentionally ending process here, so we don't
               * accidentally end up calling `cleanup.cleanUp()`
               */
              process.exit(1);
            });
        })
      }])
    }], {
      collapse: false
    })
    .run().catch(mainReject);
  });
}

module.exports = uploadToDropbox;
