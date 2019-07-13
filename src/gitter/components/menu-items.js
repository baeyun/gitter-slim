'use strict';

var log = require('loglevel');
const opn = require('opn');
var pkg = require('../package.json');
var preferences = require('../utils/user-preferences');
var events = require('../utils/custom-events');
var quitApp = require('../utils/quit-app');

var SOUNDS = require('../utils/sounds');

module.exports = function generateMenuItems(state = {}) {
  log.trace('generateMenuItems(), current preferences', Object.assign({}, preferences));

  const versionItem = {
    label: `Gitter v${pkg.version}${state.updateAvailable ? ' (update available)' : ''}`,
    enabled: state.updateAvailable,
    support: ['linux', 'win'],
  }
  if(state.updateAvailable) {
    versionItem.click = () => {
      opn('https://gitter.im/apps');
    };
  }

  return [
    versionItem,
    {
      label: 'Show in Menu Bar',
      type: 'checkbox',
      checked: preferences.showInMacMenuBar,
      support: ['osx'],
      click: function () {
        preferences.showInMacMenuBar = !preferences.showInMacMenuBar;
      }
    },
    {
      label: 'Launch on startup',
      type: 'checkbox',
      checked: preferences.launchOnStartup,
      click: function () {
        preferences.launchOnStartup = !preferences.launchOnStartup;
      },
      support: ['linux', 'win', 'osx']
    },
    {
      label: 'Launch hidden',
      type: 'checkbox',
      checked: preferences.launchHidden,
      click: function () {
        preferences.launchHidden = !preferences.launchHidden;
      },
      support: ['linux', 'win', 'osx']
    },
    {
      type: 'separator',
    },
    {
      label: 'Notifications',
      auth: true,
      content: [
        {
          label: 'Show Notifications',
          type: 'checkbox',
          checked: preferences.showNotifications,
          click: function () {
            preferences.showNotifications = !preferences.showNotifications;
          },
        },
        {
          label: 'Desktop app errors',
          type: 'checkbox',
          checked: preferences.showNotificationsForDesktopErrors,
          click: function () {
            preferences.showNotificationsForDesktopErrors = !preferences.showNotificationsForDesktopErrors;
          },
        }
      ]
    },
    {
      label: 'Notification Sound',
      auth: true,
      content: SOUNDS
    },
    {
      label: 'Gitter Next',
      type: 'checkbox',
      checked: preferences.next,
      click: events.emit.bind(events, 'menu:toggle:next')
    },
    {
      type: 'separator',
    },
    {
      label: 'Developer Tools',
      content: [
        {
          label: 'Background page',
          click: events.emit.bind(events, 'menu:toggle:background-devtools')
        },
        {
          label: 'Main window',
          click: events.emit.bind(events, 'menu:toggle:mainwindow-devtools')
        },
      ],
    },
    {
      type: 'separator',
    },
    {
      label: 'Sign Out',
      click: events.emit.bind(events, 'menu:signout'),
      auth: true
    },
    {
      label: 'Exit',
      click: quitApp,
      support: ['linux', 'win']
    }
  ].map(function (item, index) {
    item.index = index; // FIXME: unsure whether this is a good way to add index
    return item;
  });
}
