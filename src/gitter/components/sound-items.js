'use strict';

var events = require('../utils/custom-events');
var preferences = require('../utils/user-preferences');
var SOUNDS = require('../utils/sounds');

// this array will be MenuItems thus the mapping is to add defaults values
var SOUND_ITEMS = SOUNDS
  .map(function (sound, index) {
    sound.type = 'checkbox';
    sound.checked = preferences.notificationSound === index;
    sound.click = function (e) {
      preferences.notificationSound = index;
    };
    return sound;
  });

// update the checked sounds on change
events.on('preferences:change:notificationSound', function () {
  SOUND_ITEMS.forEach(function (sound, index) {
    sound.checked = preferences.notificationSound === index;
  });
});

module.exports = SOUND_ITEMS;
