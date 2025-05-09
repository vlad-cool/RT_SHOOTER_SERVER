import flask
import json
import os

os.environ['QT_LOGGING_RULES'] = 'qt.qpa.*=false'

import vectors

app = flask.Flask(__name__)

app.config.update(
    ENV='production',
    DEBUG=False,
    TESTING=False,
)

DRAW_VECTORS = False

if DRAW_VECTORS:
    vec_viz = vectors.VectorVisualizer()

class Aim:
    def __init__(self):
        self.x = 0
        self.y = 0
        self.z = 0
        self.press = False
        self.hold = False

class Vector:
    def __init__(self, x, y, z, press=False, hold=False):
        self.x = x
        self.y = y
        self.z = z
        self.press = press
        self.hold = hold

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y, self.z + other.z, other.press, other.hold)
    
    def __mul__(self, other):
        return Vector(self.x * other, self.y * other, self.z * other, self.press, self.hold)
    
    def __truediv__(self, scalar):
        return Vector(self.x / scalar, self.y / scalar, self.z / scalar, self.press, self.hold)

aims = [Aim(), Aim()]
raw_vectors = []
aim_vector = Vector(0, 0, 0)

filter_window = [0.4, 0.7, 1.0]

def filter(data, window):
    sum = Vector(0, 0, 0)
    sum_window = 0
    if len(data) < len(window):
        for i in range(len(data)):
            sum += data[i] * window[len(window) - len(data) + i]
            sum_window += window[len(window) - len(data) + i]
    else:
        for i in range(len(window)):
            sum += data[len(data) - len(window) + i] * window[i]
            sum_window += window[i]
    return sum / sum_window

@app.route("/")
def index():
    return flask.render_template("index.html")

@app.route("/motion_control")
def motion_control():
    return flask.render_template("motion_controller.html")

@app.route("/get_aim/<id>")
def get_aim(id):
    ret_val = json.dumps(aims[int(id)].__dict__)
    return ret_val

# @app.route("/set_aim/<id>", methods=["POST"])
# def set_aim(id):
#     id = int(id)
#     new_aim = json.loads(flask.request.get_data())
#     aims[id].x = int(new_aim["x"])
#     aims[id].y = int(new_aim["y"])
#     aims[id].press = bool(new_aim["press"])
#     aims[id].hold = bool(new_aim["hold"])
    
#     print(new_aim)
    
#     return "ok"

@app.route("/js/<script>")
def send_script(script):
    return flask.send_from_directory("js", script)

@app.route("/img/<image>")
def send_image(image):
    return flask.send_from_directory("img", image)

@app.route("/send_vector", methods=["POST"])
def get_vector():
    global raw_vectors
    # print(flask.request.get_data())
    data = json.loads(flask.request.get_data())
    x = data["x"]
    y = data["y"]
    z = data["z"]
    press = data["press"]
        
    raw_vectors.append(Vector(x, y, z, False, False))
    if len(raw_vectors) > len(filter_window):
        raw_vectors = raw_vectors[len(filter_window) - len(raw_vectors) : ]
    
    aim_vector = filter(raw_vectors, filter_window)
    
    if DRAW_VECTORS:
        vec_viz.draw_vector(aim_vector.x, aim_vector.y, aim_vector.z)
    
    if press:
        aim_vector.hold = aims[0].press
        aim_vector.press = True
    else:
        aim_vector.press = False
        aim_vector.hold = False
    
    # print(press,    aim_vector.press, aim_vector.hold)
    
    aims[0] = aim_vector
    
    return "ok"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
