"use strict"
const	sl 	= require('./SebLog.jsm'),
	request = require('request'),
	fs 	= require('fs'),
	path 	= require('path'),
	rootCas = require('ssl-root-cas').rootCas,
	atob 	= require('base-64').decode,
	btoa 	= require('base-64').encode;

let 	seb 	= null;

const base = module.exports = {
        id : "SebUtils",
        checkUrl : /(http|https|file)\:\/\/.*/i,
	checkP12 : /\.p12$/i,
	checkCRT : /\.crt$/i,
	checkJSON : /^\{.*\}$/,
	checkBase64 : /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/,

        init : function(obj) {
                sl.debug("init " + base.id + " start");
                seb = obj;
                sl.debug("init " + base.id + " finished");
        },

        getJSON : function (data, callback) {
                sl.debug("getJSON start");
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
				sl.error(e);
				callback(false);
				return;
			}
		}

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
				sl.error(e);
				callback(false);
				return;
			}
		}

		// check url
		let url = data;
		var isUrl = base.checkUrl.test(url.toString());

		if (isUrl) { // ToDo: put into SebNet.jsm
			// https
			let rootfile = path.resolve('../../../pki/ca/root-ca.crt');
			let signfile = path.resolve('../../../pki/ca/signing-ca.crt');
			let crtfile = path.resolve('../../../pki/certs/simple.org.crt');
			let keyfile = path.resolve('../../../pki/certs/simple.org.key');
			let cas = rootCas;
			cas.push(fs.readFileSync(rootfile));
			cas.push(fs.readFileSync(signfile));

			request.get({
				url: url,
				//url : "https://www.google.de/",
				json: true,
				agentOptions : {
					ca: cas,
					cert: fs.readFileSync(crtfile),
				        key: fs.readFileSync(keyfile)
				}
			},

			function (error, response, obj) {
				if (error) {
					sl.error("error: " + error);
					callback(false);
					return;
				}
				if (!error && response.statusCode === 200 && typeof(obj) === 'object') {
					callback(obj);
					return;
				}
				else {
					sl.error('no object:' + obj); // Print the json response
					callback(false);
					return;
				}
			});
		}
	}
};
