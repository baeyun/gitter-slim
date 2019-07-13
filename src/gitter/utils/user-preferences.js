'use strict';

const path = require('path');
const fs = require('fs-extra');
const getAppDataPath = require("appdata-path");
var debounce = require('debounce');
var Store = require('jfs');
var log = require('loglevel');
var manifest = require('../package.json');
var events = require('./custom-events');
var SOUNDS = require('./sounds');

function isBool(val) {
  return typeof val === "boolean";
}

const shallowObserver = function (obj, fn) {
  return new Proxy(obj, {
    set(target, name, val) {
      var oldValue = target[name];
      target[name] = val;
      fn([{
        name,
        object: target,
        type: 'update',
        oldValue,
      }]);
      return true;
    }
  });
};


var DEFAULT_PREFERENCES = {
  showInMacMenuBar: {
    value: true,
    validate: isBool
  },
  launchOnStartup: {
    value: true,
    validate: isBool
  },
  launchHidden: {
    value: false,
    validate: isBool
  },
  next: {
    value: false,
    validate: isBool
  },
  showNotifications: {
    value: true,
    validate: isBool
  },
  showNotificationsForDesktopErrors: {
    value: true,
    validate: isBool
  },
  notificationSound: {
    value: 1,
    validate: function (val) {
      return val >= 0 && val <= SOUNDS.length;
    }
  }
};


const appDataPath = getAppDataPath();
const preferencesFileName = 'gitter_preferences.json';
const preferencesPath = path.join(appDataPath, preferencesFileName);
const legacyPreferencesPathMatches = appDataPath.match(new RegExp(`.*?${manifest.name}`));
const legacyPreferencesPath = path.join(legacyPreferencesPathMatches && legacyPreferencesPathMatches[0], preferencesFileName);

var db = new Store(preferencesPath, { pretty: true }); // FIXME: pretty Boolean - should be environment dependent

function savePreferences(changes = []) {
  log.info('Persisting preferences', Object.assign({}, preferences));
  // save preferences everytime a change is made
  db.save('preferences', preferences, function (err) {
    // emit an event which indicates failure or success
    if (err) {
      log.error('ERROR: Could not save preferences.');
      return events.emit('preferences:failed', err);
    }

    log.info('Preferences saved', Object.assign({}, preferences));
    events.emit('preferences:saved');
  });

  // in case any component is interested on a particular setting change
  changes.forEach(function (change) {
    events.emit('preferences:change:' + change.name, change.object[change.name]);
  });

  events.emit('preferences:change');
}

// initial load is done synchronously
var preferences = db.getSync('preferences');

// Migrate preferences from 3.x over to 4.x
// FIXME: Remove after January 2017
if (Object.keys(preferences).length === 0 && legacyPreferencesPath) {
  try {
    log.info('Migrating preferences from legacy 3.x');
    fs.copySync(legacyPreferencesPath, preferencesPath);
    // Grab the new preferences
    preferences = db.getSync('settings');
    // Blat the token because we want people to sign in again with the new OAuth client ID
    preferences.token = null;

    // Remove the previous
    db.delete('settings');

    savePreferences();
  } catch(err) {
    // ignore
    log.error('Failed to migrate preferences from legacy 3.x', err);
  }
}

// setting up observable
preferences = shallowObserver(preferences, debounce((changes) => {
  savePreferences(changes);
}, 200));

// performs a check to guarantee health of preferences
Object.keys(DEFAULT_PREFERENCES)
  .forEach(function (key) {
    if (!preferences.hasOwnProperty(key)) {
      preferences[key] = DEFAULT_PREFERENCES[key].value;
    }

    var isValid = DEFAULT_PREFERENCES[key].validate(preferences[key]);

    if (!isValid) {
      log.warn('ERROR: Invalid setting:' + key + '. restoring to default');
      preferences[key] = DEFAULT_PREFERENCES[key].value;
    }
  });

// @TODO get dynamically
preferences.token = "056824df9ea8ab9d715c28103148b35e82f22c71";

log.info('Using preferences:', Object.assign({}, preferences));

module.exports = preferences;
