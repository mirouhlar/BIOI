var img;
var grid;
var nextgrid;
var dU = 1;
var dV = 0.5;
var feed = 0.029;
var k = 0.057;
var dx = 4;
var dt = 4;
var grids = 300;
var size = 800;
var Running = false;
var res = false;


function setup() {

    myCanvas = createCanvas(size, size);
    myCanvas.parent('simulation-frame');

    var canv = document.getElementById("defaultCanvas0");
    canv.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

    var width = myCanvas.width;
    var height = myCanvas.height;
    img = createImage(grids, grids);


    make_clear();

    for (var i = (grids / 2) - 10; i < (grids / 2) + 10; i++) {

        for (var j = (grids / 2) - 10; j < (grids / 2) + 10; j++) {
            grid[i][j].u = 0.5
            grid[i][j].v = 0.25
        }
    }

}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    var x = event.clientX - rect.left
    var y = event.clientY - rect.top

    x = Math.round((((x - 0) * (grids - 0)) / (size - 0)) + 0);
    y = Math.round((((y - 0) * (grids - 0)) / (size - 0)) + 0);

    if( Running == true){
        for (var i = (x-3);  i <= (x+3); i++){
            for (var j = (y-3);  j <= (y+3); j++){            
                grid[i][j].v = 1;
            }
        }
        draw();
    }


    
}


function make_clear() {
    grid = [];
    nextgrid = [];

    for (var x = 0; x < grids; x++) {
        grid[x] = [];
        nextgrid[x] = [];
        for (var y = 0; y < grids; y++) {
            grid[x][y] = { u: 1, v: 0 };
            nextgrid[x][y] = { u: 1, v: 0 };
        }
    }

}


function random_dot() {

    let randx = Math.round(Math.random() * (grids - 5));
    let randy = Math.round(Math.random() * (grids - 5));
    for (var i = randx; i < randx + 6; i++) {
        for (var y = randy; y < randy + 6; y++) {
            grid[i][y].u = (randx + 0.1) / Math.random();
            grid[i][y].v = (randy + 0.3) ** Math.random();
        }
    }
    draw();
}



function draw() {
    background(255);

    if (!Running) {
      if(res){
            grid = nextgrid;


    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var u = nextgrid[i][j].u;
            var v = nextgrid[i][j].v;

            var c = floor((u - v) * 255);
            c = constrain(c, 0, 255);
            img.set(i, j, [c, c, c, 255]);
        }
    }

    img.updatePixels();
    image(img, 0, 0, width, height);
        res = false;
      }
 image(img, 0, 0, width, height);
        return;
    }


    img.loadPixels();



    for (var x = 0; x < grids; x++) {
        for (var y = 0; y < grids; y++) {

            var u = grid[x][y].u;
            var v = grid[x][y].v;


            nextgrid[x][y].u = u + (dU * laplaceA(x, y) / (dx * dx) - u * v * v + feed * (1 - u)) * dt;
            nextgrid[x][y].v = v + (dV * laplaceB(x, y) / (dx * dx) + u * v * v - (k + feed) * v) * dt;


            nextgrid[x][y].u = constrain(nextgrid[x][y].u, 0, 1);
            nextgrid[x][y].v = constrain(nextgrid[x][y].v, 0, 1);
        }
    }
    grid = nextgrid;


    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var u = nextgrid[i][j].u;
            var v = nextgrid[i][j].v;

            var c = floor((u - v) * 255);
            c = constrain(c, 0, 255);
            img.set(i, j, [c, c, c, 255]);
        }
    }


    img.updatePixels();
    image(img, 0, 0, width, height);
}




function laplaceA(x, y) {
    var sum = 0;
    var x_l = x - 1;
    var x_r = x + 1;
    var y_u = y - 1;
    var y_d = y + 1;


    if (x == 0) {
        x_l = grids - 1;
    } else if (x == grids - 1) {
        x_r = 0;
    }

    if (y == 0) {
        y_u = grids - 1;
    } else if (y == grids - 1) {
        y_d = 0;
    }
    sum = grid[x_r][y].u + grid[x_l][y].u + grid[x][y_d].u + grid[x][y_u].u - 4 * grid[x][y].u
    return sum;
}

function laplaceB(x, y) {
    var sum = 0;

    var x_l = x - 1;
    var x_r = x + 1;
    var y_u = y - 1;
    var y_d = y + 1;

    if (x == 0) {
        x_l = grids - 1;
    } else if (x == grids - 1) {
        x_r = 0;
    }
    if (y == 0) {
        y_u = grids - 1;
    } else if (y == grids - 1) {
        y_d = 0;
    }
    sum = grid[x_r][y].v + grid[x_l][y].v + grid[x][y_d].v + grid[x][y_u].v - 4 * grid[x][y].v

    return sum;
}


/////////////////////////////////////

function startstop() {
    Running = Running ? false : true;
    let textbut = document.getElementById("startstopButton").innerHTML
    if (textbut == "Start"){
      document.getElementById("startstopButton").innerHTML = "Pause"
    }
    else{
    document.getElementById("startstopButton").innerHTML = "Start"
  }

}
function reset() {
  res = true;
    make_clear();
    feed = 0.014; k = 0.051; dU = 1; dV = 0.5;
    document.getElementById("select_presets").value = "default"
    document.getElementById("feed-rate-value").innerHTML = "Feed rate = " + feed;
    document.getElementById("feed-rate").value = feed;
    document.getElementById("kill-rate-value").innerHTML = "Kill rate = " + k;
    document.getElementById("kill-rate").value = k;
    document.getElementById("dU-value").innerHTML = "dU coefficient = " + dU;
    document.getElementById("dU").value = dU;
    document.getElementById("dV-value").innerHTML = "dV coefficient = " + dV;
    document.getElementById("dV").value = dV;
}


function change_type() {

    var choosen = document.getElementById("select_presets").value;

    switch (choosen) {
        case "Waves":
            feed = 0.014; k = 0.045; dU = 1; dV = 0.5;
            break;
        case "Chaos":
            feed = 0.026; k = 0.051; dU = 1; dV = 0.5;
            break;
        case "Spots and Loops":
            feed = 0.018; k = 0.051; dU = 1; dV = 0.5;
            break;
        case "Moving Spots":
            feed = 0.014; k = 0.054; dU = 1; dV = 0.5;
            break;
        case "Chaos and Holes":
            feed = 0.034; k = 0.056; dU = 1; dV = 0.5;
            break;
        case "Mazes":
            feed = 0.029; k = 0.057; dU = 1; dV = 0.5;
            break;
        case "Holes":
            feed = 0.039; k = 0.058; dU = 1; dV = 0.5;
            break;
        case "Pulsating Solitons":
            feed = 0.025; k = 0.060; dU = 1; dV = 0.5;
            break;
        case "Solitons":
            feed = 0.030; k = 0.062; dU = 1; dV = 0.5;
            break;

        default:
            feed = 0.014; k = 0.051; dU = 1; dV = 0.5;
    }
    document.getElementById("feed-rate-value").innerHTML = "Feed rate = " + feed;
    document.getElementById("feed-rate").value = feed;
    document.getElementById("feed-rate1").value = feed;

    document.getElementById("kill-rate-value").innerHTML = "Kill rate = " + k;
    document.getElementById("kill-rate").value = k;
    document.getElementById("kill-rate1").value = k;

    document.getElementById("dU-value").innerHTML = "dU coefficient = " + dU;
    document.getElementById("dU").value = dU;
    document.getElementById("dU1").value = dU;

    document.getElementById("dV-value").innerHTML = "dV coefficient = " + dV;
    document.getElementById("dV").value = dV;
    document.getElementById("dV1").value = dV;


}




function changef() {
    feed = parseFloat(document.getElementById("feed-rate").value);
    document.getElementById("feed-rate-value").innerHTML = "Feed rate = " + feed;
    document.getElementById("feed-rate1").value = feed;
}
function changeff() {
    feed = parseFloat(document.getElementById("feed-rate1").value);
    document.getElementById("feed-rate-value").innerHTML = "Feed rate = " + feed;
    document.getElementById("feed-rate").value = feed;
}

function changek() {
    k = parseFloat(document.getElementById("kill-rate").value);
    document.getElementById("kill-rate-value").innerHTML = "Kill rate = " + k;
            document.getElementById("kill-rate1").value = k;

}
function changekk() {
    k = parseFloat(document.getElementById("kill-rate1").value);
    document.getElementById("kill-rate-value").innerHTML = "Kill rate = " + k;
        document.getElementById("kill-rate").value = k;

}

function changedU() {
    dU = parseFloat(document.getElementById("dU").value);
    document.getElementById("dU-value").innerHTML = "dU coefficient = " + dU;
document.getElementById("dU1").value = dU;
}

function changedUu() {
    dU = parseFloat(document.getElementById("dU1").value);
    document.getElementById("dU-value").innerHTML = "dU coefficient = " + dU;
    document.getElementById("dU").value = dU;
}

function changedV() {
    dV = parseFloat(document.getElementById("dV").value);
    document.getElementById("dV-value").innerHTML = "dV coefficient = " + dV;
    document.getElementById("dV1").value = dV;
}

function changedVv() {
    dV = parseFloat(document.getElementById("dV1").value);
    document.getElementById("dV-value").innerHTML = "dV coefficient = " + dV;
    document.getElementById("dV").value = dV;
}

