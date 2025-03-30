var aimxy = { x: 500, y: 500, press: false, hold: false };

function run() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "get_data");
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = xhr.responseText;
            aimxy = JSON.parse(response);
            console.log(aimxy);
        }
        else {
            console.log("Failed to load data: " + xhr.status);
        }
    };
    xhr.send();
};

setInterval(run, 16);