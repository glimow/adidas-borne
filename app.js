const { app, BrowserWindow , globalShortcut} = require('electron');
let win;
//Ce script gère l'interface entre l'application et le système

app.on('ready', _ => {
    win = new BrowserWindow({ width: 400, height: 400 });
	globalShortcut.register("CommandOrControl+Q", ()=>{
		app.quit();
	})
	win.setFullScreen(true)
    win.loadURL(`file://${__dirname}/win.html`);
    win.on('closed', _ => win = null);
});

app.on('window-all-closed', _ => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
