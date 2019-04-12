const Octokit = require('@octokit/rest');
const Listr = require('listr');
const chalk = require('chalk');

/**
 * @param {Object} settings
 * @return {Promise}
 */
function deleteFromGithub(settings) {
  return new Promise((mainResolve, mainReject) => {
    new Listr([{
      title: 'Delete repository from GitHub',
      task: () => new Listr([{
        title: `Deleting '${settings.repositorySlug}' from GitHub...`,
        task: (ctx, task) => new Promise(async (resolve, reject) => {
          if (!settings.githubAccessToken) {
            return reject(new Error('Invalid GitHub access token'));
          }

          const octokit = new Octokit({
            auth: settings.githubAccessToken
          });

          const [owner, repo] = settings.repositorySlug.split('/');
          try {
            await octokit.repos.delete({ owner, repo });
            task.title = chalk.dim(`Successfully deleted ${settings.repositorySlug} from GitHub`);
            resolve();
            mainResolve();
          } catch (e) {
            reject(e);
            setTimeout(() => {
              console.error(`\nI've left the cloned repository and archive intact so you can inspect it at '${settings.tempDir}'.`);
              process.exit(1);
            }, 500);
          }
        })
      }])
    }], {
      collapse: false
    })
    .run().catch(mainReject);
  });
}

module.exports = deleteFromGithub;
