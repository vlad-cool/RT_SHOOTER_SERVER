var direction_vector = [0, 0, 1];
var device_vector = [0, 1, 0];

var press = false;

// window.addEventListener('devicemotion', (event) => {
//     acceleration = event.accelerationIncludingGravity;
// });

// window.addEventListener('deviceorientationabsolute', (event) => {
//     direction = event;
// });

class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static fromArray(arr) {
        return new Quaternion(arr[0], arr[1], arr[2], arr[3]);
    }

    static fromEuler(x, y, z, order = 'ZXY') {
        const c1 = Math.cos(x / 2);
        const c2 = Math.cos(y / 2);
        const c3 = Math.cos(z / 2);
        const s1 = Math.sin(x / 2);
        const s2 = Math.sin(y / 2);
        const s3 = Math.sin(z / 2);

        let q = new Quaternion();

        switch (order) {
            case 'XYZ':
                q.x = s1 * c2 * c3 + c1 * s2 * s3;
                q.y = c1 * s2 * c3 - s1 * c2 * s3;
                q.z = c1 * c2 * s3 + s1 * s2 * c3;
                q.w = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'YXZ':
                q.x = s1 * c2 * c3 + c1 * s2 * s3;
                q.y = c1 * s2 * c3 - s1 * c2 * s3;
                q.z = c1 * c2 * s3 - s1 * s2 * c3;
                q.w = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            case 'ZXY':
                q.x = s1 * c2 * c3 - c1 * s2 * s3;
                q.y = c1 * s2 * c3 + s1 * c2 * s3;
                q.z = c1 * c2 * s3 + s1 * s2 * c3;
                q.w = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'ZYX':
                q.x = s1 * c2 * c3 - c1 * s2 * s3;
                q.y = c1 * s2 * c3 + s1 * c2 * s3;
                q.z = c1 * c2 * s3 - s1 * s2 * c3;
                q.w = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            case 'YZX':
                q.x = s1 * c2 * c3 + c1 * s2 * s3;
                q.y = c1 * s2 * c3 + s1 * c2 * s3;
                q.z = c1 * c2 * s3 - s1 * s2 * c3;
                q.w = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'XZY':
                q.x = s1 * c2 * c3 - c1 * s2 * s3;
                q.y = c1 * s2 * c3 - s1 * c2 * s3;
                q.z = c1 * c2 * s3 + s1 * s2 * c3;
                q.w = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            default:
                throw new Error(`Unknown Euler angle order: ${order}`);
        }

        return q;
    }

    static fromDeviceOrientation(event) {
        if (event.rotationQuaternion) {
            return Quaternion.fromArray(event.rotationQuaternion);
        } else if (event.alpha !== null) {
            const alpha = event.alpha * (Math.PI / 180);
            const beta = event.beta * (Math.PI / 180);
            const gamma = event.gamma * (Math.PI / 180);
            return Quaternion.fromEuler(beta, gamma, alpha, 'ZXY');
        }
        return new Quaternion();
    }

    static fromAxisAngle(axis, angle) {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        return new Quaternion(
            axis.x * s,
            axis.y * s,
            axis.z * s,
            Math.cos(halfAngle)
        );
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return this;

        this.x /= len;
        this.y /= len;
        this.z /= len;
        this.w /= len;

        return this;
    }

    multiply(q) {
        const x = this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y;
        const y = this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x;
        const z = this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w;
        const w = this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z;

        return new Quaternion(x, y, z, w);
    }

    invert() {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }

    rotateVector(v) {
        const qvec = new Quaternion(v[0], v[1], v[2], 0);
        const qinv = this.invert();
        const rotated = this.multiply(qvec).multiply(qinv);
        return [rotated.x, rotated.y, rotated.z];
    }

    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }
}


if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (event) {
        direction_vector = Quaternion.fromDeviceOrientation(event).rotateVector(device_vector);
    });
} else {
    console.log('Device orientation API not supported');
}

function eulerToQuaternion(alpha, beta, gamma) {
    const c1 = Math.cos(alpha / 2);
    const c2 = Math.cos(beta / 2);
    const c3 = Math.cos(gamma / 2);
    const s1 = Math.sin(alpha / 2);
    const s2 = Math.sin(beta / 2);
    const s3 = Math.sin(gamma / 2);

    const w = c1 * c2 * c3 - s1 * s2 * s3;
    const x = s1 * s2 * c3 + c1 * c2 * s3;
    const y = s1 * c2 * c3 + c1 * s2 * s3;
    const z = c1 * s2 * c3 - s1 * c2 * s3;

    return { x: x, y: y, z: z, w: w };
}

function read_data() {
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
