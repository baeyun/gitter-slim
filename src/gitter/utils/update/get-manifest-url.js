'use strict';

var os = require('../client-type');
const urlParse = require('url-parse');

function getPlatform() {
  var platformString = os;
  if(os === 'linux') {
    platformString += (process.arch === 'ia32' ? '32' : '64');
  }

  return platformString;
}

// You can change the place we use to check and download updates with this CLI parameter `--update-url=http://192.168.0.58:3010`
// We use this for testing a release
function transposeUpdateUrl(targetUrl, updateUrlOption) {
  targetUrl = targetUrl || '';
  var parsedTargetUrl = urlParse(targetUrl);
  var parsedUpdateUrl = urlParse(updateUrlOption);
  parsedTargetUrl.set('protocol', parsedUpdateUrl.protocol || 'http:');
  parsedTargetUrl.set('auth', parsedUpdateUrl.auth);
  parsedTargetUrl.set('hostname', parsedUpdateUrl.hostname);
  parsedTargetUrl.set('port', parsedUpdateUrl.port);

  const newUrl = parsedTargetUrl.toString();
  return newUrl;
}

const MANIFEST_URLS = {
  win: 'https://update.gitter.im/win/package.json',
  win32: 'https://update.gitter.im/win/package.json',
  win64: 'https://update.gitter.im/win/package.json',
  osx: 'https://update.gitter.im/osx/package.json',
  osx32: 'https://update.gitter.im/osx/package.json',
  osx64: 'https://update.gitter.im/osx/package.json',
  mac: 'https://update.gitter.im/osx/package.json',
  mac32: 'https://update.gitter.im/osx/package.json',
  mac64: 'https://update.gitter.im/osx/package.json',
  linux32: 'https://update.gitter.im/linux32/package.json',
  linux64: 'https://update.gitter.im/linux64/package.json'
};

function getManifestUrl(updateUrlOption) {
  return transposeUpdateUrl(MANIFEST_URLS[getPlatform()], updateUrlOption);
}

module.exports = getManifestUrl;
