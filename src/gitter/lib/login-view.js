'use strict';

var log = require('loglevel');
const config = require('../utils/config');

var urlJoin = require('url-join');
var OAuth2 = require('oauth').OAuth2;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// The library requires the trailing slash
var authorizeBaseUri = urlJoin(config.baseUrl, '/');
var authorizePath = 'login/oauth/authorize';
var accessTokenPath = 'login/oauth/token';
// This URL no longer matters.
// It just needs to match the OAuth `redirect_uri`
var redirectUri = urlJoin(config.baseUrl, '/login/desktop/callback');

var LoginView = function() {
  log.trace('LoginView creating...');
  if (!config.clientId) {
    log.error('You must provide an oauth key. Keys can be obtained from https://developer.gitter.im');
    return;
  }

  var auth = new OAuth2(config.clientId, config.clientSecret, authorizeBaseUri, authorizePath, accessTokenPath);
  var authUrl = auth.getAuthorizeUrl({ redirect_uri: redirectUri, response_type: 'code' });

  // new window for login/oauth
  log.trace('LoginView opening OAuth window (hidden until finished loading) ' + authUrl);
  this.oauthWindow = nw.Window.open(authUrl, {
    // We use the same ID so windows open in the same place
    id: 'gitterLoginWindow',
    // hide page loading
    show: false,
    icon: 'img/logo.png',

    // just big enough to show GitHub login without scrollbars
    width: 1024,
    height: 720
  }, (win) => {
    log.trace('LoginView window created!');
    this.oauthWindow = win;

    this.oauthWindow.on('document-end', () => {
      log.trace('LoginView finished loading, show/focus window');
      // gitter login page finished loading visible bits
      this.oauthWindow.show();
      this.oauthWindow.focus();
    });

    this.oauthWindow.on('close', () => {
      this.destroy();
    });
  });

  // Hide the login page after pressing "Allow"
  chrome.webRequest.onBeforeRequest.addListener(
    () => {
      // login page no longer needed
      // Unsure why the hide does not work without the `setTimeout`
      // Anything lower than 150 doesn't seem to have an effect
      setTimeout(() => {
        if(this.oauthWindow) {
          this.oauthWindow.hide();
        }
      }, 150);
    },
    {
      urls: [urlJoin(config.baseUrl, '/login/oauth/authorize/decision')]
    }
  );


  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      const codeMatches = details.url.match(/.*code=(\w+)$/);
      const code = codeMatches && codeMatches[1];
      const errorMatches = details.url.match(/.*error=(\w+)$/);
      const error = errorMatches && errorMatches[1];

      if (error) {
        log.error(`OAuth error: ${error}`);
        this.destroy();
      }
      else if (code) {
        log.trace('OAuth callback code received ' + code);
        // login page no longer needed
        this.oauthWindow.hide();

        auth.getOAuthAccessToken(code, { redirect_uri: redirectUri, grant_type: 'authorization_code' }, (err, accessToken) => {
          if (err) {
            log.error('OAuth error: ' + JSON.stringify(err));
            this.destroy();
            return;
          }

          log.trace('OAuth token received ' + accessToken);
          this.emit('accessTokenReceived', accessToken);
        });
      }
      else {
        log.error(`OAuth error: no code provided in callback. URL: ${details.url}`);
      }
    },
    {
      urls: [urlJoin(config.baseUrl, '/login/desktop/callback*')]
    }
  );

  log.trace('LoginView() end');
};

util.inherits(LoginView, EventEmitter);

LoginView.prototype.destroy = function() {
  log.trace('LoginView.destroy()');
  // skips all on close listeners
  this.oauthWindow.close(true);
  this.emit('destroy');
};

module.exports = LoginView;
