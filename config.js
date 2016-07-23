const electron = require('electron');
const {BowserWindow} = electron;
const log = require('electron-log');

const base = module.exports = {
        id : "config",
        obj : {},
        init : function(obj) {
                log.debug("init " + base.id + " start");
                seb = obj;
                util = seb.util;
                if (seb.cmdline.config) {
                        util.getJSON(seb.cmdline.config,base.getJSONCallback);
                }
                log.debug("init " + base.id + " finished");
        },
        getJSONCallback : function(ret) {
                log.debug("getJSONCallback start");
                if (ret) {
                        base.obj = ret;
                }
                
                log.debug("getJSONCallback finished");
        }
};
