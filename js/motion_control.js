var acceleration = undefined;
var direction = undefined;
var direction_vector = [0, 0, 1];

var press = false;

window.addEventListener('devicemotion', (event) => {
    acceleration = event.accelerationIncludingGravity;
});

window.addEventListener('deviceorientationabsolute', (event) => {
    direction = event;
});

function read_data() {
    var alpha = direction.alpha * Math.PI / 180;

    var beta = Math.acos(acceleration.y / Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2));

    direction_vector = [Math.cos(alpha) * Math.sin(beta), Math.sin(alpha) * Math.sin(beta), Math.cos(beta)];

    // console.log(`Acceleration: X=${acceleration.x.toFixed(8).padStart(12, ' ')}, Y=${acceleration.y.toFixed(8).padStart(12, ' ')}, Z=${acceleration.z.toFixed(8).padStart(12, ' ')}, alpha=${direction.alpha.toFixed(8).padStart(12, ' ')}, beta=${direction.beta.toFixed(8).padStart(12, ' ')}, gamma=${direction.gamma.toFixed(8).padStart(12, ' ')}`);
    // console.log(`Direction vector: X=${direction_vector[0].toFixed(8).padStart(12, ' ')}, Y=${direction_vector[1].toFixed(8).padStart(12, ' ')}, Z=${direction_vector[2].toFixed(8).padStart(12, ' ')}`);
    // console.log(`Rotation: X=${gyroscope.x}, Y=${gyroscope.y}, Z=${gyroscope.z}`);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/send_vector", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 500; 

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    xhr.send(JSON.stringify({ x: direction_vector[0], y: direction_vector[1], z: direction_vector[2], press: press }));
    press = false;
}

document.addEventListener('touchstart', function (e) {
    console.log('Screen tapped at:', e.touches[0].clientX, e.touches[0].clientY);
    press = true;
});

document.addEventListener('touchend', function (e) {
    console.log('Screen released');
    // press = false;
});

setInterval(read_data, 100);
