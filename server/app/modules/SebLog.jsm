"use strict"
//var LEVELS = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ];
const log = require('winston');

log['init'] = function (loglevel) {
	log.level = (loglevel) ?  loglevel : "warn";
}
log['err'] = log.error; // compat

module.exports = log;
