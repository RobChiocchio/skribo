const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const fs = require("fs"); //filesystem
const {Menu, MenuItem} = remote

var notePath = "";

const contextMenu = new Menu();
contextMenu.append(new MenuItem({label: 'Undo', role: 'undo' }));
contextMenu.append(new MenuItem({label: 'Redo', role: 'redo' }));
contextMenu.append(new MenuItem({type: 'separator'}))
contextMenu.append(new MenuItem({label: 'Cut', role: 'cut' }));
contextMenu.append(new MenuItem({label: 'Copy', role: 'copy' }));
contextMenu.append(new MenuItem({label: 'Paste', role: 'paste' }));
contextMenu.append(new MenuItem({type: 'separator'}))
contextMenu.append(new MenuItem({label: 'Select all', role: 'selectall' }));
contextMenu.append(new MenuItem({type: 'separator'}))
contextMenu.append(new MenuItem({label: 'Insert Equation', enabled: false })); // TODO: add KATEX and/or MathQuill support!

var optionsMenu = new Menu();
optionsMenu.append(new MenuItem({label: 'Pin note', click() { pinNote(); }, id: "isNotePinned", checked: false }));
optionsMenu.append(new MenuItem({label: 'Close note', click() { closeNote(); }}));
optionsMenu.append(new MenuItem({label: 'Close all', click() { closeAll(); }}));
optionsMenu.append(new MenuItem({label: 'Delete note', click() { deleteNote() }}));

ipcRenderer.on("loadFile", (event, arg) => {
    notePath = arg;

    console.log(notePath);

    fs.readFile(notePath, "utf8", function(err, data){
        if (err) {
            if (document.getElementById("editor").textContent == null) {
                quill.setText("Hello, world!");
            }
            return console.error(err);
        } else {
            let buff = document.getElementById("editor").textContent;
            quill.setText(data.trim());
            if (buff != null) {
                quill.insertText(buff);
            }
        }
    })
});

var quill = new Quill('#editor', {
    modules: {
        syntax: false,
        toolbar: null
    },
    formats: {
        bold: true,
        size: false,
        link: false
    },
    theme: 'bubble'
});

quill.on('text-change', function(delta, oldDelta, source) {
    if (source == 'api') {
        console.log("An API call triggered this change.");
    } else if (source == 'user') {
        fs.writeFile(notePath, document.getElementById("editor").textContent, function(err, data){ //should this be synchronous instead?
            if (err) {
                return console.error(err);
            }
        });
    }
});

function pinNote() {
    const window = remote.getCurrentWindow();
    let isNotePinned = !window.isAlwaysOnTop();
    window.setAlwaysOnTop(isNotePinned);
    //optionsMenu.getMenuItemById("isNotePinned").checked = isNotePinned; // TODO: Doesn't update automatically, fix
}

function closeNote() {
    const window = remote.getCurrentWindow();
    window.close();
}

function closeAll() {
    ipcRenderer.sendSync("closeAll");
}

function newNote() {
    ipcRenderer.send("newNote");
}

function deleteNote() {
    // TODO: add prompt to confirm deletion!
    try {
        fs.unlinkSync(notePath); // delete the note
    } catch (err) {
        console.error(err.message); // log error
    }

    closeNote();
}

function init() {
    document.getElementById("buttonOptions").addEventListener("click", function(e) {
        e.preventDefault()
        optionsMenu.popup({window: remote.getCurrentWindow()})
    }, false);

    document.getElementById("buttonNewNote").addEventListener("click", function(e) {
        newNote();
    });

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        contextMenu.popup({window: remote.getCurrentWindow()})
    }, false)
}

document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        init();
    }
}