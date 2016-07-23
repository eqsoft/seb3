const electron = require('electron');
const {BowserWindow} = electron;
const log = require('electron-log');

const http = require('http');
const https = require('https');
const atob = require('base-64').decode;
const btoa = require('base-64').encode;

const base = module.exports = {
        id : "util",
        checkUrl : /(http|https|file)\:\/\/.*/i,
	checkP12 : /\.p12$/i,
	checkCRT : /\.crt$/i,
	checkJSON : /^\s*?\{.*\}\s*?$/,
	checkBase64 : /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/,

        init : function(obj) {
                log.debug("init " + base.id + " start");
                seb = obj;
                win = seb.win;
                log.debug("init " + base.id + " finished");
        },

        getJSON : function (data,callback) {
                log.debug("getJSON start");
		// check base64
		if (base.checkBase64.test(data)) {
			try {
				var obj = JSON.parse(atob(data));
				if (typeof obj === "object") {
					callback(obj);
						return;
				}
				else {
					callback(false);
					return;
				}
			}
			catch(e) {
				log.error(e);
				callback(false);
				return;
			}
		}
                log.debug("getJSON finished");
                /*
		// check json
		if (base.checkJSON.test(data)) {
			try {
				var obj = JSON.parse(data);
				if (typeof obj === "object") {
					callback(obj);
					return;
				}
				else {
					callback(false);
					return;
				}
			}
			catch(e) {
				sl.err(e);
				callback(false);
				return;
			}
		}
		// check url
		let url = data;
		var isUrl = base.checkUrl.test(url.toString());

		if (!isUrl) {
			let f = FileUtils.File(url);
			if (!f || !f.exists()) {
				sl.err("wrong url for getJSON: " + url);
				callback(false);
				return;
			}
			else {
				url = fph.newFileURI(f).spec;
			}
		}
		sl.debug("try to load json object: " + url);
		Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newChannel(url, "", null).asyncOpen({
			_data: "",
			onDataAvailable: function (req, ctx, str, del, n) {
				var ins = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(Ci.nsIScriptableInputStream)
				ins.init(str);
				this._data += ins.read(ins.available());
			},
			onStartRequest: function () {},
			onStopRequest: function () {
				try {
					var obj = JSON.parse(this._data);
					callback(obj);
				}
				catch(e) {
					sl.err("error: " + e);
					callback(false);
				}
			}
		}, null);
                */
	}
};
