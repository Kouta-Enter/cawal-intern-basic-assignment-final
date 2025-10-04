import json
import flask
from flask_cors import CORS

app = flask.Flask(__name__)
CORS(app)
@app.route("/")
def get():
    """get"""
    data=[]
    return json.dumps(data)#jsonに変換して渡す(new)

@app.route("/update")
def update():
    """uptate data"""
    return flask.redirect('/')#@app.route("/")へリダイレクト

@app.route("/insert")
def insert():
    """add task"""
    return flask.redirect('/')#@app.route("/")へリダイレクト

@app.route("/delete")
def delete():
    """delete task"""
    return flask.redirect('/')#@app.route("/")へリダイレクト


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
