# github-repo-cleanup

> Clones GitHub repositories, zips them up and uploads them to Dropbox. Also, if specified, deletes the repository from GitHub.

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
