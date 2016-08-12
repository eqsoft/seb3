const	electron		= require('electron'),
	{
		app,
		BrowserWindow,
		webContents
	} 			= electron,
	sl 			= require('./SebLog.jsm'),
	su			= require('./SebUtils.jsm');

let 	seb 			= null;

const base = module.exports = {
        id : "SebWin",
        mainWin : null,
        contents : null,
        init : function(obj) {
                sl.debug("init " + base.id + " start");
                seb = obj;
                //base.createMainWindow();
                sl.debug("init " + base.id + " finished");
        },

        createMainWindow : function() {
                sl.debug("createMainWindow start");
                // Create the browser window.
                base.mainWin = new BrowserWindow({show: false, frame: true });
		base.mainWin.once('ready-to-show', () => {
			base.mainWin.maximize();
			base.mainWin.show();
		});
                base.contents = base.mainWin.webContents;
                //console.dir(base.contents);
                /*
                base.contents.on('new-window',base.newWindow);
                base.contents.on('load-url',base.onLoadUrl);
                base.contents.on('did-get-response-details',base.onResponseDetails);
                */
                base.contents.on('dom-ready',base.onDomReady);

                //base.mainWin.on('did-finish-load', base.onload);
                base.mainWin.on('closed', base.onClose);
                // and load the index.html of the app.
                //base.mainWin.loadURL(`file://${__dirname}/browser.html`);
		base.mainWin.loadURL('file://'+require.resolve('../content/browser.html'));
                // Open the DevTools.
                if (seb.cmdline.devmode && seb.cmdline.devmode === "1") {
                        base.mainWin.webContents.openDevTools();
                }
                sl.debug("createMainWindow finished");
        },

        // EventLister
        // LowLevel webContents Listener
        onDomReady : function(evt) {
                //console.dir(base.mainWin);
        },

        newWindow : function(evt,url,frame,dispo,opts) {
                sl.debug("newWindow");
                //console.dir(evt);
        },
        // evt, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType
        onResponseDetails : function(evt, status, newURL, originalURL, httpResponseCode, requestMethod, referrer, headers, resourceType) {
                //log.debug("XXXX: " + httpResponseCode);
        },

        onLoadUrl : function(url) {
                sl.debug("onLoadUrl:" + url);
        },

        onClose : function() {
                sl.debug("onclose");
                base.mainWin = null;
        },

        onLoad : function(w) {
                sl.debug("onLoad: " + w);
        }
};
