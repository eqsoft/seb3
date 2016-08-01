"use strict"
const 	fs 		= require('fs'),
	path		= require('path'),
	express 	= require('express'),
	basicAuth 	= require('basic-auth'),
	auth 		= require('http-auth'),
	basic 		= auth.basic({
		realm: "Basic Area",
		file: __dirname + "/users"
	}),
	serveStatic = require('serve-static'),
	serveIndex = require('serve-index'),
	docRoot = __dirname + '/htdocs';

const 	CA_CN 	= "Simple Signing CA",
	USR_CN	= "seb.client",
	ADM_CN	= "seb.admin",
	monitorPort = 8441,
	socketPort = 8442,
	devApp = true,
	devPort = 8443,
	devClientCert = false,
	socketClientCert = false,
	monitorClientCert = false,
	proxy = false,
	proxyServerPort = 8337,
	proxyTargetPort = 8338,
	proxyTarget = 'http://localhost:'+proxyTargetPort,
	proxyAuth = true;

const base = module.exports = {
	caCN : CA_CN,
	usrCN : USR_CN,
	admCN : ADM_CN,
	monitorPort : monitorPort,
	socketPort : socketPort,
	devApp : devApp,
	devPort : devPort,
	devClientCert : devClientCert,
	socketClientCert : socketClientCert,
	monitorClientCert : monitorClientCert,
	proxy : proxy,
	proxyServerPort : proxyServerPort,
	proxyTargetPort : proxyTargetPort,
	proxyTarget : proxyTarget,
	proxyAuth : proxyAuth,
	auth : auth,
	basic : basic,

	getClientCertOptions : function() {
		var options = 	{
				key:    fs.readFileSync(__dirname + '/ssl/simple.org.key'),
				cert:   fs.readFileSync(__dirname + '/ssl/simple.org.crt'),
				ca:     [
						fs.readFileSync(__dirname + '/ssl/root-ca.crt'),
						fs.readFileSync(__dirname + '/ssl/signing-ca.crt')
					],
				requestCert:        true, 	// client cert is required
				rejectUnauthorized: false 	// reject invalid client certs
				}
		return options;
	},

	getOptions : function() {
		var options = 	{
				key:    fs.readFileSync(__dirname + '/ssl/simple.org.key'),
				cert:   fs.readFileSync(__dirname + '/ssl/simple.org.crt'),
				ca:     [
						fs.readFileSync(__dirname + '/ssl/root-ca.crt'),
						fs.readFileSync(__dirname + '/ssl/signing-ca.crt')
					],
				requestCert:        false, 	// client cert is required
				rejectUnauthorized: false 	// reject invalid client certs
				}
		return options;
	},

	getApp : function() {
		var app = express();
		app["__port"] = 0;
		var checkClientCert = false;

		// get port
		app.use(function(req,res,next) {
			if (req.socket.server && req.socket.server.address) {
				app["__port"] = req.socket.server.address().port;
			}
			else {
				if (req.socket.pair && req.socket.pair.server && req.socket.pair.server.address) {
					app["__port"] = req.socket.pair.server.address().port;
				}
			}
			if (app.__port == 0) {
				console.log('can not get port');
				res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
				res.end('can not get port');
			}
			else {
				next();
			}
		});

		// check client certs
		app.use(function(req,res,next) { // Check Auth: only SSL connection with valid client certs are allowed, otherwise ANONYMOUS (dev certs see: user.p12 and admin.p12
			if (app.__port == devPort && devClientCert) {
				checkClientCert = true;
			}

			if (app.__port == socketPort && socketClientCert) {
				checkClientCert = true;
			}

			if (app.__port == monitorPort && monitorClientCert) {
				checkClientCert = true;
			}

			if (checkClientCert) {
				// this should not be reached in productive ssl environments (rejectUnauthorized = true)
				if (!req.connection.getPeerCertificate().subject) {
					res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
					res.end('You need a valid client certificate: wrong client');
				}
				else {

					var subject = null;
					var issuer = null;
					// Safari has problems with client cert handshake on websocket connections!
					try {
						subject = req.connection.getPeerCertificate().subject.CN;
						console.log("server req subject CN: " + subject);
					}
					catch(e) {
						res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
						res.end('SSL Error: failed to get certificate subject CN!');
						return;
					}
					try {
						issuer = req.connection.getPeerCertificate().issuer.CN;
						//console.log("server req issuer CN: " + issuer);
					}
					catch(e) {
						res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
						res.end('SSL Error: failed to get certificate issuer!');
						return;
					}
					if (issuer != CA_CN) {
						res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
						res.end('You need a valid client certificate: wrong issuer!');
						return;
					}
					next();
				}
			}
			else {
				next();
			}
		});
		// routes
		app.use('/', serveStatic(docRoot));
		app.use('/basic', auth.connect(basic));
		app.use('/basic', serveStatic(docRoot + '/dev'));
		app.use('/dev', serveStatic(docRoot + '/dev'));
		app.use('/websocket', serveStatic(docRoot + '/websocket'));
		app.use('/websocket/data', serveIndex(docRoot + '/websocket/data',{'icons':true}));
		app.use('/download', function(req, res) {
			var file = docRoot + '/websocket/data/test.seb';
			var filename = path.basename(file);
			//var mimetype = mime.lookup(file);
			res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
			//res.setHeader('Content-type', mimetype);
			var filestream = fs.createReadStream(file);
			filestream.pipe(res);
		});
		app.use('/json', function(req, res) {
			//var js = require('./dev/res/config.json');
			//console.log(js);
			var file = docRoot + '/dev/res/config.json';
			var js = JSON.parse(fs.readFileSync(file));
			//res.setHeader('Content-type', 'application/json');
			//res.json({sebServer: {socket:'jhghg'},bla:'blub',blubber:[1,2,3]});
			res.json(js);
		});
		return app;
	}
}
