'use strict';

const log = require('loglevel');
const opn = require('opn');

const notifier = require('../notifier');

// Check for updates every 10 minutes
const NOTIFY_UPDATE_POLLING_RATE = 10 * 60 * 1000;
// Only show a notification to update every 72 hours
const NOTIFY_UPDATE_INTERVAL_TIME = 72 * 60 * 60 * 1000;

var lastNotifyUpdateTime = -1;
function scheduleUpdateNotifyCallback(callback) {
  const cb = () => {
    callback();
    lastNotifyUpdateTime = Date.now();
  };

  cb();
  setInterval(() => {
    var timeSinceNotify = Date.now() - lastNotifyUpdateTime;

    if(timeSinceNotify >= NOTIFY_UPDATE_INTERVAL_TIME) {
      cb();
    }
  }, NOTIFY_UPDATE_POLLING_RATE);
}

function setupUpdateNotifications(version) {
  function notify() {
    log.info('Showing notification for new version: ' + version);
    notifier({
      title: 'Gitter ' + version + ' Available',
      message: 'Head over to gitter.im/apps to update.',
      click: function() {
        log.info('Update notification clicked, opening gitter.im/apps');
        opn('https://gitter.im/apps');
      }
    });
  }

  scheduleUpdateNotifyCallback(notify);
}


module.exports = setupUpdateNotifications
