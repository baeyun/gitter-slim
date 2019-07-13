'use strict';

const win = nw.Window.get();
const frame = win.window.document.getElementById('mainframe');
const config = require('./utils/config');

frame.src = config.baseUrl;
