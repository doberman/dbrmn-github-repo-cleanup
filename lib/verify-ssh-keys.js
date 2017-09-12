const fs = require('fs');
const path = require('path');
const SshAgent = require('ssh-agent');

/**
 * @param {Object} settings
 * @return {Promise}
 */
function verifySshKeys(settings) {
  return new Promise((resolve, reject) => {
    new SshAgent().requestIdentities((err, keys) => {
      if (err) {
        console.error('Failed to verify SSH keys: ', err.message);
        return reject();
      }

      if (!keys.length) {
        let errorMessages = [
          'It looks like you don\'t have any keys added to the SSH agent.'
        ];

        const assumedPrivateKeyFilename = 'id_rsa';
        const assumedPrivateKeyPath = path.join(settings.homeDir, '.ssh', assumedPrivateKeyFilename);
        if (fs.readdirSync(path.join(settings.homeDir, '.ssh')).includes(assumedPrivateKeyFilename)) {
          errorMessages = errorMessages.concat([
            `But! \`${assumedPrivateKeyPath}\` might be a key that you can use.`,
            `\nTry \`ssh-add -K ${assumedPrivateKeyPath}\`, and then try again.`
          ]);
        } else {
          errorMessages.push(`Add your SSH key to it with e.g. \`ssh-add -K ${settings.homeDir}/id_rsa\`.`);
        }

        console.error(errorMessages.join('\n'));
        return reject();
      }

      resolve();
    });
  });
}

module.exports = verifySshKeys;
