'use strict';

var log = require('loglevel');
log.setDefaultLevel('debug');

var Promise = require('bluebird');
const urlJoin = require('url-join');
var AutoLaunch = require('auto-launch');
var Gitter = require('gitter-realtime-client');

var pkg = require('../package.json');
const config = require('./utils/config');
log.setLevel(config.logLevel);
var preferences = require('./utils/user-preferences');
var CLIENT = require('./utils/client-type');
// var notifier = require('./utils/notifier');
var events = require('./utils/custom-events');
// var quitApp = require('./utils/quit-app');
const pollForUpdates = require('./utils/update/poll-for-updates');

// components
var generateMenuItems = require('./components/menu-items');
var CustomTray = require('./components/tray');
var CustomMenu = require('./components/menu');
var TrayMenu = require('./components/tray-menu');

var LoginView = require('./lib/login-view');

process.on('uncaughtException', function (err) {
  log.error('Caught exception: ' + err, { exception: err });
  log.error(err.stack);

  if (preferences.showNotificationsForDesktopErrors) {
    // @TODO handle
    // notifier({
    //   title: 'Uncaught error in app (open devtools)',
    //   message: err,
    //   click: function() {
    //     showBackgroundDeveloperTools();
    //   }
    // });
  }
});

var win;
var mainWindow; // this is the chat window (logged in)
var loginView; // log in form
var state = {
  updateAvailable: false
};

var autoLauncher = new AutoLaunch({
  name: 'Gitter'
});

(function () {
  log.info('execPath:', process.execPath);
  log.info('version:', pkg.version);

  pollForUpdates();
  events.on('update:available', () => {
    state.updateAvailable = true;
  });

  initGUI(); // intialises menu and tray, setting up event listeners for both
  initApp();

  autoLauncher.isEnabled(function(enabled) {
    if(enabled !== preferences.launchOnStartup) {
      autoLauncher[(preferences.launchOnStartup ? 'enable' : 'disable')](function(err) {
        if(err) {
          throw err;
        }
      });
    }
  });

})();

// reopen window when they are all closed
function reopen() {
  if (!mainWindow) {
    if(!preferences.token || preferences.token.length === 0) {
      return showAuth();
    }
    return showLoggedInWindow();
  }
}

function setupTray(win) {
  var customTray = new CustomTray();
  win.tray = customTray.get();

  var roomMenu = new TrayMenu();
  win.tray.menu = roomMenu.get();

  // FIXME: temporary fix, needs to be repainted
  events.on('traymenu:updated', function() {
    win.tray.menu = roomMenu.get();
  });

  // Set unread badge
  events.on('traymenu:unread', function(unreadCount) {
    win.setBadgeLabel(unreadCount.toString());
  });

  // Remove badge
  events.on('traymenu:read', function() {
    win.setBadgeLabel('');
  });

  if (CLIENT !== 'osx') {
    win.tray.on('click', reopen);
  }
}

// initialises and adds listeners to the top level components of the UI
function initGUI() {
  log.trace('initGUI()');
  win = nw.Window.get();

  // Set up tray(OSX)/menu bar(Windows)
  if(preferences.showInMacMenuBar) {
    setupTray(win);
  }

  events.on('preferences:change:showInMacMenuBar', function(newValue) {
    if(newValue) {
      setupTray(win);
    }
    else if(win.tray) {
      win.tray.remove();
    }
  });

  nw.App.on('reopen', reopen); // When someone clicks on the dock icon, show window again.

  win.on('close', function (evt) {
    log.trace('win:close');
    if (evt === 'quit') {
      // quitApp();
    } else {
      this.close(true);
    }
  });
}

function addAuthHeadersMiddleware(details) {
  details.requestHeaders.push({
    name: 'Authorization',
    value: `Bearer ${preferences.token}`
  });

  return {
    requestHeaders: details.requestHeaders
  };
}

// establishes faye connection and manages signing in/out flow
function initApp() {
  var token = preferences.token;
  const hasToken = token && token.length > 0;
  log.trace('initApp -> hasToken?', hasToken, token);

  if(hasToken) {
    // Be sure to remove this later on when we sign out (see signout())
    chrome.webRequest.onBeforeSendHeaders.addListener(
      addAuthHeadersMiddleware,
      {
        urls: [
          urlJoin(config.baseUrl, '/*'),
          'https://api.gitter.im/*'
        ]
      },
      ['blocking', 'requestHeaders']
    );
  }
  // user not logged in
  else {
    showAuth();
    return;
  }

  events.emit('user:signedIn');
  events.on('traymenu:clicked', navigateWindowTo);
  events.on('traymenu:signout', signout);
  events.on('menu:signout', signout);

  events.on('menu:toggle:next', function () {
    if (!mainWindow) return;
    const iframeTarget = mainWindow.window.document.getElementById('mainframe');
    var isNextActive = mainWindow.eval(iframeTarget, "document.cookie.indexOf('gitter_staging=staged');") >= 0;
    log.trace('toggle:next is next currently active? ' + isNextActive);
    if (isNextActive) {
      log.trace('toggle:next Going to production');
      preferences.next = false;
      mainWindow.eval(iframeTarget, "document.cookie='gitter_staging=none;domain=.gitter.im;path=/;expires=' + new Date(Date.now() + 31536000000).toUTCString(); location.reload();");
    } else {
      log.trace('toggle:next Going to next/staging');
      preferences.next = true;
      mainWindow.eval(iframeTarget, "document.cookie='gitter_staging=staged;domain=.gitter.im;path=/;expires=' + new Date(Date.now() + 31536000000).toUTCString(); location.reload();");
    }
  });

  events.on('menu:toggle:background-devtools', showBackgroundDeveloperTools);
  events.on('menu:toggle:mainwindow-devtools', showMainWindowDeveloperTools);

  events.on('user:signedOut', function () {
    client.disconnect();
    client = null;
  });

  events.on('preferences:change:launchOnStartup', function(newValue) {
    autoLauncher[(newValue ? 'enable' : 'disable')](function(err) {
      if(err) throw err;
    });
  });

  let terminating = false;
  const accessTokenFailureExtension = {
    incoming: Gitter.wrapExtension(function (message, callback) {
      if (message.error && message.advice && message.advice.reconnect === 'none') {
        // advice.reconnect == 'none': the server has effectively told us to go away for good
        if (!terminating) {
          terminating = true;
          // More needs to be done here!
          log.error('Access denied. Realtime communications with the server have been disconnected.', message);

          window.alert('Realtime communications with the server have been disconnected.');
          signout();
        }
      }

      callback(message);
    })
  };

  // Realtime client to keep track of the user rooms.
  var client = new Gitter.RealtimeClient({
    fayeUrl: config.fayeUrl,
    authProvider: function(cb) {
      return cb({ token: token, client: CLIENT });
    },
    extensions: [
      accessTokenFailureExtension
    ],
  });

  var rooms = new Gitter.RoomCollection([], { client: client, listen: true });

  client.on('change:userId', function (userId) {
    events.emit('realtime:connected', rooms);
    log.trace('realtime connected()');

    if (!client) return;
    log.trace('attempting to subscribe()');
    client.subscribe('/v1/user/' + userId, function (msg) {

      if (msg.notification === 'user_notification') {
        log.info('Showing user_notification: ' + msg.title);
        // @TODO handle
        // notifier({
        //   title: msg.title,
        //   message: msg.text,
        //   icon: msg.icon,
        //   click: function() {
        //     log.info('Notification user_notification clicked. Moving to', msg.link);
        //     navigateWindowTo(msg.link);
        //   }
        // });
      }
      else if(msg.error && msg.advice && msg.advice.reconnect === 'none') {
        log.info('Realtime communications with the server have been disconnected. Signing out...')
        signout();
      }
    });
  });

  if (preferences.launchHidden !== true) {
    showLoggedInWindow();
  }
}

function showAuth() {
  log.trace('showAuth, loginView exists?' + !!loginView);
  if (loginView) return;

  loginView = new LoginView();

  loginView.on('accessTokenReceived', function(accessToken) {
    log.trace('accessTokenReceived' + accessToken);
    if (loginView) {
      preferences.token = accessToken;
      initApp(accessToken);
      loginView.destroy();
    }
  });

  loginView.on('destroy', function() {
    loginView = null;
  });
}

function signout() {
  log.trace('signout() started');

  // Remove the middleware so we don't try to pass a `null` token which
  // would cause us to be in a `/login` redirect loop
  chrome.webRequest.onBeforeSendHeaders.removeListener(addAuthHeadersMiddleware);

  flushCookies()
    .then(function () {
      preferences.token = null;

      // only close the window if we can, otherwise app may crash
      if (mainWindow) {
        mainWindow.close(true);
      }

      showAuth();

      events.emit('user:signedOut');
      log.trace('signout() complete!');
    });
}

/**
 * showLoggedInWindow() handles the logic for displaying loggedin.html
 *
 * exec   - String, code to be evaluated once the iFrame has loaded.
 * @void
 */
function showLoggedInWindow(exec) {
  log.trace('showLoggedInWindow()');

  nw.Window.open('loggedin.html', {
    // We use the same ID so windows open in the same place
    id: 'gitterLoggedInWindow',
    focus: true,
    width: 1200,
    height: 800,
  }, (win) => {
    mainWindow = win;
    const iframeTarget = mainWindow.window.document.getElementById('mainframe');

    var menu = new CustomMenu({
      label: 'Gitter',
      generateMenuItems: () => generateMenuItems(state),
      filter: function (item) {

        if (item.support && item.support.indexOf(CLIENT) < 0) {
          return false;
        }

        if (item.auth) {
          return item.auth && !!preferences.token;
        }

        return true;
      }
    });

    mainWindow.menu = menu.get();

    // FIXME: temporary fix, needs to be repainted
    events.on('menu:updated', function () {
      log.trace('menu:updated re-painting menu in mainwindow', mainWindow);
      if (mainWindow) {
        mainWindow.menu = null;
        mainWindow.menu = menu.get();
      }
    });

    mainWindow.on('loaded', function () {
      if (exec) {
        mainWindow.eval(iframeTarget, exec);
      }
    });

    mainWindow.on('closed', function () {
      log.trace('mainWindow:closed');
      mainWindow = null;
    });

    mainWindow.on('focus', function () {
      log.trace('mainWindow:focus');
      // TODO: Remove this hack
      var toExec = "var cf = document.getElementById('content-frame'); if (cf) cf.contentWindow.dispatchEvent(new Event('focus'));";
      mainWindow.eval(iframeTarget, toExec);
    });

    mainWindow.on('blur', function () {
      log.trace('mainWindow:blur');
      // TODO: Remove this hack
      var toExec = "var cf = document.getElementById('content-frame'); if (cf) cf.contentWindow.dispatchEvent(new Event('blur'));";
      mainWindow.eval(iframeTarget, toExec);
    });

    mainWindow.on('new-win-policy', function (frame, url, policy) {
      nw.Shell.openExternal(url);
      policy.ignore();
    });
  });
}

function showMainWindowDeveloperTools() {
  log.trace('showMainWindowDeveloperTools()');

  mainWindow.showDevTools();
}

function showBackgroundDeveloperTools() {
  log.trace('showBackgroundDeveloperTools()');

  // Show dev tools for the background page
  // via https://github.com/nwjs/nw.js/issues/4578#issuecomment-222745051
  chrome.developerPrivate.openDevTools({
    renderViewId: -1,
    renderProcessId: -1,
    extensionId: chrome.runtime.id
  });
}

function navigateWindowTo(uri) {
  var toExec = "window.gitterLoader('" + uri + "');";

  if (!mainWindow) {
    // load window and then navigate
    return showLoggedInWindow(toExec);
  }

  // simply navigate as we have window
  const iframeTarget = mainWindow.window.document.getElementById('mainframe');
  mainWindow.eval(iframeTarget, toExec);
  mainWindow.focus();
  mainWindow.show();
}

function deleteCookie(cookie) {
  return new Promise(function (resolve, reject) {
    var cookie_url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path;

    win.cookies.remove({ url: cookie_url, name: cookie.name }, function (result) {
      if (result) {
        log.info('cookie removed:' + result.name);
        resolve(result);
      } else {
        log.error('failed to remove cookie');
        reject(new Error('Failed to delete cookie.'));
      }
    });
  });
}

function fetchAllCookies() {
  log.trace('fetchAllCookies()');
  return new Promise(function (resolve) {
    win.cookies.getAll({}, function (cookies) {
      resolve(cookies);
    });
  });
}

function flushCookies() {
  return new Promise(function (resolve) {
    fetchAllCookies()
      .then(function (cookies) {
        log.debug('got ' + cookies.length + ' cookies');
        return Promise.all(cookies.map(deleteCookie));
      })
      .then(function () {
        log.info('deleted all cookies');
        resolve(true);
      })
      .catch(function (err) {
        log.error(err.stack);
      });
  });
}
