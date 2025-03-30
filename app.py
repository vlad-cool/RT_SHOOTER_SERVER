import flask
import json
import os

app = flask.Flask(__name__)

JS_DIR = os.path.join(app.static_folder, "js")

class Aim:
    def __init__(self):
        self.x = 500
        self.y = 500
        self.press = False
        self.hold = False

aims: list[Aim] = [Aim(), Aim()]

@app.route("/")
def index():
    return flask.render_template("index.html")

@app.route("/get_aim/<id>")
def get_aim(id):
    return json.dumps(aims[id])

@app.route("/set_aim/<id>", methods=["POST"])
def set_aim(id):
    id = int(id)
    new_aim = json.loads(flask.request.get_data())
    aims[id].x = int(new_aim["x"])
    aims[id].y = int(new_aim["y"])
    aims[id].press = bool(new_aim["press"])
    aims[id].hold = bool(new_aim["hold"])
    
    print(new_aim)
    
    return "ok"

@app.route("/js/<path:script>")
def send_script(script):
    if ".." in script or not script.endswith(".js"):
        flask.abort(404)
    
    script_path = os.path.join(JS_DIR, script)
    if not os.path.isfile(script_path) or not script_path.startswith(JS_DIR):
        flask.abort(404)
    
    return flask.send_from_directory(
        JS_DIR,
        script,
        mimetype="application/javascript",
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
