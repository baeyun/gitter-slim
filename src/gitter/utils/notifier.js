'use strict';

var objectAssign = require('object-assign');

var preferences = require('./user-preferences');
var SOUNDS_ITEMS = require('../components/sound-items');

function playNotificationSound() {
  var audio = window.document.createElement('audio');
  var sound = SOUNDS_ITEMS[preferences.notificationSound];

  if (!sound.path) {
    return;
  }

  audio.src = sound.path;
  audio.play();
  audio = null;
}

var notifierDefaults = {
  title: '',
  message: '',
  // gitterHQ logo
  icon: 'https://avatars.githubusercontent.com/u/5990364?s=60',
  click: undefined
};

module.exports = function (options) {
  var opts = objectAssign({}, notifierDefaults, options);

  if (!preferences.showNotifications) return;

  playNotificationSound();

  const notification = new window.Notification(opts.title, {
    body: opts.message,
    icon: opts.icon
  });

  notification.onclick = () => {
    if(opts.click) {
      opts.click();
    }
  };
};
