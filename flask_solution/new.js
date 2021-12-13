let canvas;

function setup() {
    canvas = createCanvas(300, 300);
    // background(255);
    mojInit();
}

function draw() {
    if(frameCount % 1 == 0){
        mojafunkcia();  
    }
                     
}
function mojafunkcia(){
    let imageBase64String = canvas.elt.toDataURL();
    let my_answer;
    console.log('To send:');
    console.log(imageBase64String);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:5000/update', false);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "image/png");
    xhr.setRequestHeader("Accept", "image/png");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            my_answer = JSON.parse(this.response);
        }
    }
    xhr.send(imageBase64String);

    new_base_64 = my_answer.status;
    console.log('Received:');
    console.log(new_base_64);

    // would_be_added = 'data:image/png;base64,';

    // var txt2 = new_base_64.slice(0, 2) + would_be_added + new_base_64.slice(2);
    txt2 = new_base_64;
    // txt2 = txt2.slice(2,-1)
    console.log('Changed:');
    console.log(txt2);

    let showImg = createImg(txt2, "");
    // var profile = new Image();
    // profile.src = txt2;
    showImg.hide(); 

    image(showImg, 0, 0, width, height);  
     
}


function mojInit(){
    let imageBase64String = canvas.elt.toDataURL();
    let my_answer;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", 'http://localhost:5000/init', false);

    //Send the proper header information along with the request
    xhr.setRequestHeader("Content-Type", "image/png");
    xhr.setRequestHeader("Accept", "image/png");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

    xhr.onreadystatechange = function() { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            my_answer = JSON.parse(this.response);
        }
    }
    xhr.send(imageBase64String);

    new_base_64 = my_answer.status;
    txt2 = new_base_64;

    let showImg = createImg(txt2, "");
    showImg.hide(); 

    image(showImg, 0, 0, width, height);  
}
