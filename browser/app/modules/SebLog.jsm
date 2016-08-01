"use strict"
let seb	= null;
//var LEVELS = [ 'error', 'warn', 'info', 'verbose', 'debug', 'silly' ];
const log = require('electron-log');
log['init'] = function (obj) {
	seb = obj;
	//log.log((seb.cmdline.logfile && (seb.cmdline.logfile==1 || seb.cmdline.logfile=="1")));
	log.transports.file.level = (seb.cmdline.loglevel) ?  seb.cmdline.loglevel : "warn";
	log.transports.console.level = (seb.cmdline.loglevel) ?  seb.cmdline.loglevel : "warn";
	if (!seb.cmdline.logfile || (seb.cmdline.logfile!=1 && seb.cmdline.logfile!="1")) {
		log.transports.file = false;
	}
	log['err'] = log.error;
	seb.log = log;
}

module.exports = log;
