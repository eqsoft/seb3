"use strict"
const	electron 	= require('electron'),
	{app} 		= electron,
	sl 		= require('./SebLog.jsm'),
	su 		= require('./SebUtils.jsm'),
	sg 		= require('./SebConfig.jsm'),
	sw 		= require('./SebWin.jsm'),
	ss		= require('../../../server/app/modules/SebServer.jsm');

let regCmdLine = /\-(.*?)\=(.*)/;

const base = module.exports = {
        id : "seb",
        cmdline : {},
	config : null,
	defaultConfig : null,
	log : null,
        init : function() {
                //sl.debug("init " + base.id + " start");
                base.initCmdLine();
		sl.init(base);
		su.init(base);
		sw.init(base);
                sg.init(base);
		sg.initConfig(base.initAfterConfig);
		//
                //sw.init(base);
		//sg.initConfig(base.initAfterConfig);
                //sl.debug("init " + base.id + " finished");
        },

        initCmdLine : function() {
                //sl.debug("initCmdLine start");
                for (var i=0;i<process.argv.length;i++) {
                        //log.debug(process.argv[i]);
                        let m = process.argv[i].match(regCmdLine);
                        //log.debug(m.length);
                        if (m && m.length === 3) {
                                //log.debug(m[1] + ":" + m[2]);
                        	base.cmdline[m[1]] = m[2];
                        }
                }
                //sl.debug(base.cmdline);
                //sl.debug("initCmdLine finished");
        },

	initAfterConfig : function() {
		sl.debug("initAfterConfig start");
		if (base.config === null) {
			sl.err("initConfig failed");
			return false;
		}
		if (base.config.sebServerEnabled) {
			// Do something
			if (base.config.sebServer.local) {
				ss.init(base);
			}
		}
		if (!sw.mainWin) {
                        sw.createMainWindow();
                }
		sl.debug("initAfterConfig finished");
	},

        activate : function() {
                sl.debug("avtivate start");
                if (!sw.mainWin) {
                        sw.createMainWindow();
                }
                sl.debug("avtivate finished");
        },

        quit : function() {
                sl.debug("quit start");
                app.quit();
                sl.debug("quit finished");
        }
};
