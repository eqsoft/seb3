const electron = require('electron');
const {app} = electron;
const log = require('electron-log');
const _config = require('./config.js');
const _win = require('./win.js');
const _util = require('./util.js');

let regCmdLine = /\-(.*?)\=(.*)/;

const base = module.exports = {
        id : "seb",
        cmdline : {},
        config : _config,
        win : _win,
        util : _util,
        init : function() {
                log.debug("init " + base.id + " start");
                base.initCmdLine();
                base.config.init(base);
                base.win.init(base);
                base.util.init(base);
                log.debug("init " + base.id + " finished");
        },
        initCmdLine : function() {
                log.debug("initCmdLine start");
                for (var i=0;i<process.argv.length;i++) {
                        //log.debug(process.argv[i]);
                        let m = process.argv[i].match(regCmdLine);
                        //log.debug(m.length);
                        if (m && m.length === 3) {
                                //log.debug(m[1] + ":" + m[2]);
                                base.cmdline[m[1]] = m[2];
                        }
                }
                log.debug(base.cmdline);
                log.debug("initCmdLine finished");
        }
};
