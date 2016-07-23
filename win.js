const electron = require('electron');
const {BowserWindow} = electron;
const log = require('electron-log');

const base = module.exports = {
        id : "win",
        init : function(obj) {
                log.debug("init " + base.id + " start");
                seb = obj;
                util = seb.util;
                log.debug("init " + base.id + " finished");
        }
};
