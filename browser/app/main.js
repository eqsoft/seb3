const electron = require('electron');
// Module to control application life.
// const {app, BrowserWindow} = electron;
const {app} = electron;
// log
// const sl = require('electron-log');
const seb = require('./modules/seb.jsm');

app.on('ready', seb.init);
app.on('window-all-closed',seb.quit);
app.on('activate', seb.activate);
