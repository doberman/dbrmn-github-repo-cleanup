#!/usr/bin/env node

const path = require('path');
const { promisify } = require('util');
const shellSource = promisify(require('shell-source'));
const chalk = require('chalk');
const columnify = require('columnify');
const args = require('commander');
const inquirer = require('inquirer');
const pkg = require('./package.json');

// lib
const cleanup = require('./lib/cleanup');
const compress = require('./lib/compress');
const clone = require('./lib/clone');
const verifySshKeys = require('./lib/verify-ssh-keys');
const uploadToDropbox = require('./lib/dropbox-upload');
const deleteFromGithub = require('./lib/delete-from-github');

// configure CLI
args
  .version(pkg.version)
  .description(pkg.description)
  .usage('<github-repo-slug> [options]')
  .option('-d, --deleteFromGithub', 'Delete GitHub reposity upon successful archive')
  .option('-v --verbose', 'Show debug information')
  .parse(process.argv);

const homeDir = process.env.HOME || process.env.USERPROFILE;
const settings = {
  homeDir,
  configFilePath: path.join(homeDir, '.githubrepocleanuprc'),
  tempDir: '/tmp/github-repo-cleanup',
  deleteRepositoryFromGithub: args.deleteFromGithub,
  verbose: args.verbose,
  dropboxAccessToken: process.env.DROPBOX_ACCESS_TOKEN,
  githubAccessToken: process.env.GITHUB_ACCESS_TOKEN,

  // these are set below
  repositorySlug: null,
  repositoryName: null,
  repositoryUrl: null,
  clonedRepositoryPath: null,
  compressedRepositoryPath: null
};

settings.repositorySlug = process.argv[2];
if (!settings.repositorySlug) {
  args.help();
} else if (!/^([^/\s]+)\/{1,}([^/\s]+)$/.test(settings.repositorySlug)) {
  console.error(`Invalid GitHub repository slug \`${settings.repositorySlug}\``);
  args.help();
}

(async () => {
  // load up configuration file
  try {
    await shellSource(settings.configFilePath);
  } catch (e) {
    console.error(`Failed to load up configuration file ${settings.configFilePath}: `, e);
    cleanup.cleanUpAndExit(1);
  }

  // attempt to re-set access tokens from sourced environment variables
  settings.dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
  settings.githubAccessToken = process.env.GITHUB_ACCESS_TOKEN;

  if (!settings.repositorySlug) {
    console.error(`Invalid repository slug '${settings.repositorySlug}'`);
    process.exit(1);
  }

  settings.repositoryName = path.basename(settings.repositorySlug);
  settings.repositoryUrl = `git@github.com:${settings.repositorySlug}`;
  settings.clonedRepositoryPath = path.join(settings.tempDir, settings.repositoryName);

  if (settings.verbose) {
    const settingsWithPlaceholderValues = {};
    Object.keys(settings).forEach((key) => {
      settingsWithPlaceholderValues[key] = settings[key] || '<empty>';
    });
    console.log(chalk.dim('\nLoaded configuration:'));
    console.log(chalk.dim(columnify(settingsWithPlaceholderValues)));
  }

  if (settings.deleteRepositoryFromGithub) {
    // prompt the user for confirmation
    const confirmationKey = `confirmDelete_${settings.repositorySlug.replace(/[^a-z/_]/gi, '_')}`;
    const inquirerResults = await inquirer.prompt({
      type: 'confirm',
      name: confirmationKey,
      message: `This will clone '${settings.repositorySlug}', archive it to Dropbox and finally ${chalk.underline(chalk.italic('delete'))} it from GitHub. Are you sure?`,
      default: false
    });

    if (!inquirerResults[confirmationKey]) {
      // negative confirmation from user, clean up and exit
      return cleanup.cleanUpAndExit(1);
    }
  }

  try {
    // user confirmed, move on to verify SSH keys
    await verifySshKeys(settings);

    // SSH keys looks valid, move on to clone the repository
    await clone(settings);

    // repository cloned, move on to compress it
    await compress(settings);

    // repository compressed, move on to upload it to Dropbox
    await uploadToDropbox(settings);

    // repository uploaded to Dropbox, delete it from GitHub
    if (settings.deleteRepositoryFromGithub) {
      await deleteFromGithub(settings);
    }

    // all done, clean up
    await cleanup.cleanUp(settings);
  } catch (e) {
    console.error('Failed:', settings.verbose ? e : e.message);
    process.exit(1);
  }
})();
