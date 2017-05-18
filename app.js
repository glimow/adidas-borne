const { app, BrowserWindow , globalShortcut, dialog} = require('electron');
let win;
//Ce script gère l'interface entre l'application et le système

app.on('ready', _ => {
    win = new BrowserWindow({ width: 400, height: 400 , frame:false});
	globalShortcut.register("CommandOrControl+Q", ()=>{
		app.quit();
	});
  globalShortcut.register("Escape", ()=>{
    dialog.showMessageBox({message:"Voulez vous sortir de la Testimony Box ?", buttons: ["Non","Oui"] }, function(result){
      if (result==1) {
        app.quit();
      }
    })
  });
 win.setFullScreen(true)
    win.loadURL(`file://${__dirname}/win.html`);
    win.on('closed', _ => win = null);
});

app.on('window-all-closed', _ => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
