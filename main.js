'use strict'; // don't ignore bad code

const electron = require("electron");
const app = electron.app; // control app
const BrowserWindow = electron.BrowserWindow; // create native browser window
const ipcMain = electron.ipcMain;
const fs = require("fs");
const path = require("path");

let notesPath = path.join(app.getPath("userData"), "notes");
console.log(notesPath);
var windows = [];
var windowNames = [];

if (!fs.existsSync(notesPath)){ //if notesPath does not exist
    fs.mkdirSync(notesPath, true); //create directory recursively
}

function createWindow(notePath = null) {
    let window = new BrowserWindow({
        width: 300,
        height: 250,
        minWidth: 150,
        minHeight: 125,
        frame: false, // remove frame from windows apps
        titleBarStyle: 'hidden', // hide mac titlebar
        transparent: true, //allow rounded corners
        icon: '',
        // TODO: add JSON file that stores note position and other properties
    });

    window.loadFile('index.html');
  
    window.webContents.openDevTools(); // DEBUG: Open the DevTools.
  
    window.on('closed', function () { // Emitted when the window is closed.
        window = null;
        //pop window?
    });

    if (notePath == null) {
        let newNoteID = 1;
        if (windowNames.length > 0) {
            newNoteID = windowNames[windowNames.length-1];
            console.log(newNoteID);
        }

        if (isNaN(newNoteID)) {
            console.log("Uh oh! NaN error!");
            return;
        }

        do {
            ++newNoteID;
            console.log(newNoteID.toString());
            notePath = path.join(notesPath, newNoteID.toString() + ".txt");
            console.log(notesPath);
        } while (fs.existsSync(notePath))
        //notePath = path.join(notesPath, (windows.length + 1).toString() + ".txt"); // TODO: fix this!!! windows.length + 1 doesnt work!! if a note is closed it will screw up everything!!
    }

    window.webContents.on('did-finish-load', () => {
        window.webContents.send("loadFile", notePath); // send the note's path to the note
    });

    console.log("Opening note " + notePath);
    windows.push(window);
}

function createWindows() { //initialize
    fs.readdir(notesPath, (err, files) => {
        files = files.filter(file => fs.lstatSync(path.join(notesPath, file)).isFile()); // TODO: find a better way to filter out directories. also filter out invalid text files
        if (files == undefined || files.length <= 0) {
            createWindow();
        } else {
            files.forEach(file => {
                createWindow(path.join(notesPath, file));
                let noteID = Number(path.basename(file).split('.')[0]); // TODO: find a better way to do this?
                if (!isNaN(noteID)) {
                    windowNames.push(noteID);
                }
            });
        }
    });

    //if no files found, create a window anyways?
}

ipcMain.on("closeAll", (event, arg) => {
    windows.forEach(window => {
        try {
            window.close();
        } catch (e) {
            console.error(e);
        }
    });

    app.quit();
});

ipcMain.on("newNote", function(){
    createWindow();
});

app.on('ready', function () { // called when Electron has finished initialization
    createWindows();
});

app.on('window-all-closed', function () { // Quit when all windows are closed.
    if (process.platform !== 'darwin') { // OSX quit fix
        app.quit();
    }
});

app.on('activate', function () {
    if (windows.length <= 0) { //if no existing notes found
        createWindows();
    }
});