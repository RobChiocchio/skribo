'use strict'; // don't ignore bad code

const electron = require('electron');
const app = electron.app; // control app
const BrowserWindow = electron.BrowserWindow; // create native browser window
const ipcMain = electron.ipcMain;

let mainWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
        width: 475,
        height: 615,
        minWidth: 200,
        minHeight: 150,
        frame: false, // remove frame from windows apps
        titleBarStyle: 'hidden' // hide mac titlebar
    });
  
    mainWindow.setIcon
    
    mainWindow.loadFile('app/index.html');
  
    //mainWindow.webContents.openDevTools(); // Open the DevTools.
  
    
    mainWindow.on('closed', function () { // Emitted when the window is closed.
        mainWindow = null;
    });
}

app.on('ready', createWindow); // called when Electron has finished initialization

  
app.on('window-all-closed', function () { // Quit when all windows are closed.
    if (process.platform !== 'darwin') { // OSX quit fix
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) { //mac fix
    createWindow();
    }
});