require('require.async')(require);
const electron = require('electron');
const {app} = electron;
const fs = require('fs');
const extend = require('extend');
//const path = require('path');
const sl = require('./SebLog.jsm');
const su = require('./SebUtils.jsm');

const base = module.exports = {
        id : "SebConfig",
	callback : null,
        init : function(obj) {
                sl.debug("init " + base.id + " start");
                seb = obj;
                sl.debug("init " + base.id + " finished");
        },

	initConfig : function(cb) {
		base.callback = cb;
		base.initDefaultConfig();
	},

	initDefaultConfig : function() {
		sl.debug("initDefaultConfig start");
		require.async('../default.json',
			function(obj) {
				sl.debug("default config found");
				seb.defaultConfig = obj;
				base.initCustomConfig();
			},
			function(err) {
				sl.err("no defaultConfig: " + require.resolve('../default.json') + "!");
				base.callback.call(null,null);
			}
		);
	},

	initCustomConfig : function() {
		sl.debug("initCustomConfig start");
		function _cb(obj) { // for remote files
			if (!obj) {
				base.noCustomConfig(seb.cmdline.config);
			}
			else {
				base.customConfig(obj);
			}

		}
		let configParam = (seb.cmdline.config && seb.cmdline.config != "") ? seb.cmdline.config : false;
		if (configParam) { // ignore local config
			su.getJSON(configParam,_cb);
		}
		else {
			require.async('../config.json',
				function(obj) {
					base.customConfig(obj);
				},
				function(err) {
					base.noCustomConfig(require.resolve('../config.json'));
				}
			);
		}
	},

	customConfig : function(obj) {
		sl.debug("config found");
		if (seb.defaultConfig != null) {
			sl.debug("merging configs...");
			seb.config = extend(true,seb.defaultConfig,obj);
			sl.silly(seb.config);
		}
		else {
			sl.debug(seb.defaultConfig);
			seb.config = obj;
		}
		base.callback.call(null,null);
	},

	noCustomConfig : function(src) {
		if (seb.defaultConfig != null) {
			sl.warn("no config found: " + src);
			sl.warn("falling back to default config: " + require.resolve('../default.json'));
			seb.config = seb.defaultConfig;
		}
		else {
			sl.err("no config or default config file found");
		}
		base.callback.call(null,null);
	},

        getUrl : function() {
		let url = seb.cmdline.url;
		if (url !== null) {
			return url;
		}
		url = base.obj["startURL"];
		if (url !== undefined) {
			return url;
		}
		return false;
        }
};
