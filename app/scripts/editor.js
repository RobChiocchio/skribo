const fs = require("fs"); //filesystem

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

fs.readFile('skribo.txt', "utf8", function(err, data){
    if (err) {
        quill.setText("Hi!");
        return console.error(err);
    } else {
        quill.setText(data);
    }
})

quill.on('text-change', function(delta, oldDelta, source) {
    if (source == 'api') {
        console.log("An API call triggered this change.");
    } else if (source == 'user') {
        fs.writeFile('skribo.txt', document.getElementById("editor").textContent, function(err, data){ //should this be synchronous instead?
            if (err) {
                return console.error(err);
            }
        });
    }
});