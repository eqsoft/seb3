const 	electron	= 	require('electron'),
	{app} 		= 	electron,
	seb 		= 	require('./modules/seb.jsm')

app.on('ready', seb.init)
app.on('window-all-closed',seb.quit)
app.on('activate', seb.activate)
