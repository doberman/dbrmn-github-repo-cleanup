# github-repo-cleanup

> CLI tool to clone GitHub repositories, zip them up and — if specified — delete the repository from GitHub.

## Requirements

This project requires [NodeJS](https://nodejs.org) v8.0+.

## Installation

Install via [npm](https://npmjs.com):

```
npm i -g github-repo-cleanup
```

## Setup

Create a config file at `~/.githubrepocleanuprc`, add your
[Dropbox access token](https://www.dropbox.com/developers/apps)
and [GitHub access token](https://github.com/settings/tokens) accordingly, e.g.:

```
export DROPBOX_ACCESS_TOKEN=...
export GITHUB_ACCESS_TOKEN=...
```

## Usage

```
github-repo-cleanup <github-repo-slug>
```

...where `<github-repo-slug>` is the path to the repository on Github,
e.g. `username/repo`.

For more help, try `github-repo-cleanup -h`;
