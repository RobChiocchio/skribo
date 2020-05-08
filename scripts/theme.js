var palettes = [ //text color, background color, select color
    ["#7f8fa6", "#353b48"],
    //add more
];

function applyRandomTheme() {
    var palette = palettes[Math.floor(Math.random()*palettes.length)];
    document.getElementById("buttonClose").color = palette[0];
    var body = document.getElementById("body");
    body.style.color = palette[0];
    body.style.background = palette[1];
}

applyRandomTheme();