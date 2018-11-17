const fs = require("fs"); //filesystem
const writePath = require("os").homedir() + '/Documents/skribo.txt';

var quill = new Quill('#editor', {
    modules: {
        syntax: false
    },
    formats: {
        bold: true,
        size: false,
        link: false
    },
    theme: 'bubble'
});

fs.readFile(writePath, "utf8", function(err, data){
    if (err) {
        quill.setText("Hello, world!");
        return console.error(err);
    } else {
        quill.setText(data);
    }
})

quill.on('text-change', function(delta, oldDelta, source) {
    if (source == 'api') {
        console.log("An API call triggered this change.");
    } else if (source == 'user') {
        fs.writeFile(writePath, document.getElementById("editor").textContent, function(err, data){ //should this be synchronous instead?
            if (err) {
                return console.error(err);
            }
        });
    }
});