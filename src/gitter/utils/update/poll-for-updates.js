'use strict';

const Promise = require('bluebird');
const log = require('loglevel');
const argv = require('yargs')(process.argv).argv;
const semver = require('semver');
const request = Promise.promisify(require('request'));

const manifest = require('../../../package.json');
const getManifestUrl = require('./get-manifest-url');
const setupUpdateNotifications = require('./setup-update-notifications');
const events = require('../custom-events');

// 30 minutes
const UPDATE_POLLING_RATE = 30 * 60 * 1000;
const updateUrlOption = argv.updateUrl || 'https://update.gitter.im';

function pollForUpdates() {
  const remoteManifestUrl = getManifestUrl(updateUrlOption);
  log.info('Checking for updates, ' + remoteManifestUrl);

  request({
      url: remoteManifestUrl,
      method: 'GET'
    })
    .then((res) => {
      log.info('Remote manifest content:\n' + res.body);
      return JSON.parse(res.body);
    })
    .then((remoteManifest) => {
      return Promise.props({
        remoteManifest: remoteManifest,
        needsUpdate: semver.gt(remoteManifest.version, manifest.version)
      });
    })
    .then(({ remoteManifest, needsUpdate }) => {
      if(needsUpdate) {
        const newVersion = remoteManifest.version;
        log.info('App update ' + newVersion + ' available');
        setupUpdateNotifications(remoteManifest.version);
        events.emit('update:available');
      }
      else {
        log.info('App currently at latest version');
      }
    })
    .then(() => {
      setTimeout(pollForUpdates, UPDATE_POLLING_RATE);
    })
    .catch((err) => {
      log.error('Some error occured while checking for updates', err);
      setTimeout(pollForUpdates, UPDATE_POLLING_RATE);
    });
}

module.exports = pollForUpdates;
