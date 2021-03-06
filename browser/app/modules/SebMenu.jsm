const	electron	= require('electron'),
	{app, Menu} 	= electron,
	sl 		= require('./SebLog.jsm')

let 	seb 		= null

const base = module.exports = {
        id : "SebMenu",
	appname : app.getName(),
	init: function(obj) {
		sl.debug("init " + base.id + " start");
                seb = obj;
		base.initTemplate();
                sl.debug("init " + base.id + " finished");
	},

	initTemplate : function() {
		const template = [
		  {
		    label: 'Edit',
		    submenu: [
		      {
		        role: 'undo'
		      },
		      {
		        role: 'redo'
		      },
		      {
		        type: 'separator'
		      },
		      {
		        role: 'cut'
		      },
		      {
		        role: 'copy'
		      },
		      {
		        role: 'paste'
		      },
		      {
		        role: 'pasteandmatchstyle'
		      },
		      {
		        role: 'delete'
		      },
		      {
		        role: 'selectall'
		      }
		    ]
		  },
		  {
		    label: 'View',
		    submenu: [
		      {
		        label: 'Reload',
		        accelerator: 'CmdOrCtrl+R',
		        click (item, focusedWindow) {
		          if (focusedWindow) focusedWindow.reload()
		        }
		      },
		      {
		        label: 'Toggle Developer Tools',
		        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
		        click (item, focusedWindow) {
		          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
		        }
		      },
		      {
		        type: 'separator'
		      },
		      {
		        role: 'togglefullscreen'
		      }
		    ]
		  },
		  {
		    role: 'window',
		    submenu: [
		      {
		        role: 'minimize'
		      },
		      {
		        role: 'close'
		      }
		    ]
		  },
		  {
		    role: 'help',
		    submenu: [
		      {
		        label: 'Learn More',
		        click () { electron.shell.openExternal('http://electron.atom.io') }
		      }
		    ]
		  }
		]

		if (process.platform === 'darwin') {
		  template.unshift({
		    label: base.appname,
		    submenu: [
		      {
		        role: 'about'
		      },
		      {
		        type: 'separator'
		      },
		      {
		        role: 'services',
		        submenu: []
		      },
		      {
		        type: 'separator'
		      },
		      {
		        role: 'hide'
		      },
		      {
		        role: 'hideothers'
		      },
		      {
		        role: 'unhide'
		      },
		      {
		        type: 'separator'
		      },
		      {
		        role: 'quit'
		      }
		    ]
		  })
		  // Window menu.
		  template[3].submenu = [
		    {
		      label: 'Close',
		      accelerator: 'CmdOrCtrl+W',
		      role: 'close'
		    },
		    {
		      label: 'Minimize',
		      accelerator: 'CmdOrCtrl+M',
		      role: 'minimize'
		    },
		    {
		      label: 'Zoom',
		      role: 'zoom'
		    },
		    {
		      type: 'separator'
		    },
		    {
		      label: 'Bring All to Front',
		      role: 'front'
		    }
		  ]
		}
		const menu = Menu.buildFromTemplate(template)
		Menu.setApplicationMenu(menu)
	}
}
