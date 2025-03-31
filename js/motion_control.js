// let accelerometer = new Accelerometer({ frequency: 60 });
// // accelerometer.addEventListener('reading', () => {
// //     console.log(`Acceleration: X=${accelerometer.x}, Y=${accelerometer.y}, Z=${accelerometer.z}`);
// // });
// // accelerometer.start();

// let gyroscope = new Gyroscope({ frequency: 60 });
// // gyroscope.addEventListener('reading', () => {
// //     console.log(`Rotation: X=${gyroscope.x}, Y=${gyroscope.y}, Z=${gyroscope.z}`);
// // });
// // gyroscope.start();

var acceleration = undefined;
var direction = undefined;
var direction_vector = [0, 0, 1];

window.addEventListener('devicemotion', (event) => {
    acceleration = event.accelerationIncludingGravity;

    // acceleration.x += event.acceleration.x;
    // acceleration.y += event.acceleration.y;
    // acceleration.z += event.acceleration.z;

    // console.log('Acceleration:', event.acceleration);
    // console.log('Acceleration (incl. gravity):', event.accelerationIncludingGravity);
    // console.log('Rotation rate:', event.rotationRate);
});

window.addEventListener('deviceorientationabsolute', (event) => {
    direction = event;

    // function eulerToVector(eulerAngles, initialVector = [0, 0, 1]) {
    const [yaw, pitch, roll] = [-direction.alpha * Math.PI / 180, direction.beta * Math.PI / 180, direction.gamma * Math.PI / 180];
    const [x, y, z] = [0, -1, 0];

    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const x1 = x * cosYaw - y * sinYaw;
    const y1 = x * sinYaw + y * cosYaw;
    const z1 = z;

    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const x2 = x1 * cosPitch + z1 * sinPitch;
    const y2 = y1;
    const z2 = -x1 * sinPitch + z1 * cosPitch;

    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);
    const x3 = x2;
    const y3 = y2 * cosRoll - z2 * sinRoll;
    const z3 = y2 * sinRoll + z2 * cosRoll;

    direction_vector = [x3, y3, z3];
});

function read_data() {
    console.log(`Acceleration: X=${acceleration.x.toFixed(8).padStart(12, ' ')}, Y=${acceleration.y.toFixed(8).padStart(12, ' ')}, Z=${acceleration.z.toFixed(8).padStart(12, ' ')}, alpha=${direction.alpha.toFixed(8).padStart(12, ' ')}, beta=${direction.beta.toFixed(8).padStart(12, ' ')}, gamma=${direction.gamma.toFixed(8).padStart(12, ' ')}`);
    console.log(`Direction vector: X=${direction_vector[0].toFixed(8).padStart(12, ' ')}, Y=${direction_vector[1].toFixed(8).padStart(12, ' ')}, Z=${direction_vector[2].toFixed(8).padStart(12, ' ')}`);
    // console.log(`Rotation: X=${gyroscope.x}, Y=${gyroscope.y}, Z=${gyroscope.z}`);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/send_vector", true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Success:', JSON.parse(xhr.responseText));
        } else {
            console.error('Error:', xhr.statusText);
        }
    };
    xhr.onerror = function () {
        console.error('Request failed');
    };
    xhr.send(JSON.stringify({ x: direction_vector[0], y: direction_vector[1], z: direction_vector[2] }));
}

setInterval(read_data, 200);