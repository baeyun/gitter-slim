'use strict';

const log = require('loglevel');
const argv = require('yargs')(nw.App.argv).argv;
const os = require('../utils/client-type');
let oauthJson = { osx: {}, win: {}, linux: {} };
try {
  oauthJson = require('../oauth.json');
} catch (e) {
  log.warn('nwapp/oauth.json not found. Hopefully OAUTH_KEY and OAUTH_SECRET environment variables are set...');
}


module.exports = {
  logLevel: argv.logLevel || 'debug',
  clientId: process.env.OAUTH_KEY || oauthJson[os].key || '',
  clientSecret: process.env.OAUTH_SECRET || oauthJson[os].secret || '',
  baseUrl: argv.baseUrl || 'https://gitter.im/',
  fayeUrl: argv.fayeUrl || 'https://ws.gitter.im/bayeux',
  updateUrl: argv.updateUrl || 'https://update.gitter.im'
};
