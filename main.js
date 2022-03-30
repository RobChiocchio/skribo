"use strict"; // don't ignore bad code

const electron = require("electron");
const app = electron.app; // control app
const BrowserWindow = electron.BrowserWindow; // create native browser window
const ipcMain = electron.ipcMain;
const fs = require("fs");
const path = require("path");

const extension = ".txt"; // TODO: use custom format?

let notesPath = path.join(app.getPath("userData"), "notes");
let iconPath = path.join(__dirname, "icon-placeholder.ico"); // process.resourcesPath
console.log(iconPath);
let configPath = path.join(app.getPath("userData"), "config.json");
let config = {};
let windows = [];
let windowNames = [];
let tray = null;

const configDefault = {
    "showOnTaskbar": true,
    "notes": []
}

const noteDefaults = {
    width: 300,
    height: 250,
    x: 0,
    y: 0,
    alwaysOnTop: false
}

if (!fs.existsSync(notesPath)){ //if notes directory does not exist
    fs.mkdirSync(notesPath, true); //create directory
}

if (!fs.existsSync(configPath)){ //if config file does not exist
    let configData = JSON.stringify(configDefault);
    fs.writeFileSync(configPath, configData);
}

config = fs.readFileSync(configPath); // TODO: catch errors AND ACTUALLY USE CONFIG

function createWindow(notePath = null) {
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
            notePath = path.join(notesPath, newNoteID.toString() + extension);
            console.log(notesPath);
        } while (fs.existsSync(notePath))
    }

    let window = new BrowserWindow({
        width: 300,
        height: 250,
        minWidth: 150,
        minHeight: 125,
        frame: false, // remove frame from windows apps
        titleBarStyle: "hidden", // hide mac titlebar
        transparent: true, //allow rounded corners
        skipTaskbar: true, // dont show on taskbar
        icon: "",
        // TODO: add JSON file that stores note position and other properties
    });

    window.loadFile("index.html");
  
    //window.webContents.openDevTools(); // DEBUG: Open the DevTools.
  
    window.on("closed", function () { // Emitted when the window is closed
        window = null;
        // TODO: save data to config file
        // TODO: pop window
    });

    window.on("move", function () { // Emitted when the window is moved // TODO: can I make only call when its DONE moving?
        let position = window.getPosition();
        // TODO: write data to conifg var
    });

    window.on("resize", function () { // Emitted when the window is resized // TODO: can I make only call when its DONE resizing?
        let size = window.getSize();
        // TODO: write data to conifg var
    })

    window.on("always-on-top-changed", function () { // Emitted when the window is pinned/unpinned
        let alwaysOnTop = window.isAlwaysOnTop();
        // TODO: write data to conifg var
    });

    window.webContents.on("did-finish-load", () => {
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
                let noteID = Number(path.basename(file).split('.')[0]); // TODO: find a better way to do this?
                createWindow(path.join(notesPath, file));
                if (!isNaN(noteID)) {
                    windowNames.push(noteID); // TODO: rework this system
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

app.on("ready", function () { // called when Electron has finished initialization
    createWindows();

    tray = new electron.Tray(iconPath);
    tray.setToolTip("skribo");
    tray.setContextMenu(new electron.Menu()); // TODO: make a tray menu
});

app.on("window-all-closed", function () { // Quit when all windows are closed.
    if (process.platform !== "darwin") { // OSX quit fix
        app.quit();
    }
});

app.on("activate", function () {
    if (windows.length <= 0) { //if no existing notes found
        createWindows();
    }
});