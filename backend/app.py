"""Task-manager API"""
import json
import flask
import mysql.connector
from flask_cors import CORS

# MySQLに接続
conn = mysql.connector.connect(
    host="db", user="user", password="pass", database="appdata"
)

# カーソルを取得
cursor = conn.cursor(dictionary=True)

# データベース作成
CREATE_TABLE_QUERY = """
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN
)
"""
cursor.execute(CREATE_TABLE_QUERY)
cursor.close()
conn.close()

app = flask.Flask(__name__)
CORS(app)
app.logger.setLevel('DEBUG')
@app.route("/")
# def hi():
#     return 'hi'
def get():
    """test"""
    # MySQLに接続
    conn_g = mysql.connector.connect(
        host="db", user="user", password="pass", database="appdata"
    )

    # カーソルを取得
    cursor_g = conn_g.cursor(dictionary=True)
    cursor_g.execute(
        """
SELECT *
FROM tasks
"""
    )
    result = cursor_g.fetchall()  # dict型
    cursor_g.close()
    conn_g.close()
    print(result)
    app.logger.info('data is send')
    return json.dumps(result)


@app.route("/update", methods=["POST"])
def update():
    """uptate data"""
    # MySQLに接続
    conn_u = mysql.connector.connect(
        host="db", user="user", password="pass", database="appdata"
    )
    # カーソルを取得
    cursor_u = conn_u.cursor(dictionary=True)
    if "title" in flask.request.get_json():
        ud_title = [
            flask.request.get_json()["title"],
            int(flask.request.get_json()["id"])
        ]
        update_title_query = "UPDATE tasks SET title = %s WHERE id = %s"
        cursor_u.execute(update_title_query, ud_title)
    if "comp" in flask.request.get_json():
        ud_comp = [
            int(flask.request.get_json()["comp"]),
            int(flask.request.get_json()["id"])
        ]
        update_completed_query = "UPDATE tasks SET completed = %s WHERE id = %s"
        cursor_u.execute(update_completed_query, ud_comp)
    conn_u.commit()
    # 接続を閉じる
    cursor_u.close()
    conn_u.close()
    print(flask.request.form.get("id"))
    print()
    return flask.redirect("/")  # @app.route("/")へリダイレクト


@app.route("/insert", methods=["POST","GET"])
def insert():
    """add task"""
    # MySQLに接続
    conn_i = mysql.connector.connect(
        host="db", user="user", password="pass", database="appdata"
    )
    # カーソルを取得
    cursor_i = conn_i.cursor(dictionary=True)
    title =[]
    title.append(flask.request.get_json()["title"])
    app.logger.debug('DEBUG:')
    app.logger.debug(title)#[None]
    app.logger.debug(flask.request.get_json())
    app.logger.debug(flask.request.args.get("title"))
    if flask.request.get_json():
        app.logger.debug('insert ran')
        insert_query = "INSERT INTO tasks (title, completed) VALUES (%s, false)"
        cursor_i.execute(insert_query, title)
        conn_i.commit()
    # 接続を閉じる
    cursor_i.close()
    conn_i.close()
    app.logger.debug('debug')
    return flask.redirect("/")  # @app.route("/")へリダイレクト

@app.route("/delete", methods=["POST"])
def delete():
    """delete task"""
    # MySQLに接続
    conn_d = mysql.connector.connect(
        host="db", user="user", password="pass", database="appdata"
    )
    # カーソルを取得
    cursor_d = conn_d.cursor(dictionary=True)
    task_id = [int(flask.request.get_json()["id"])]
    delete_query = "DELETE FROM tasks WHERE id = %s"
    cursor_d.execute(delete_query, task_id)
    conn_d.commit()
    cursor_d.close()
    conn_d.close()
    return flask.redirect("/")  # @app.route("/")へリダイレクト


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000,debug=True)
