import flask
import mysql.connector

# MySQLに接続
conn = mysql.connector.connect(host="db", user="user", password="pass", database="appdata")

# カーソルを取得
cursor = conn.cursor(dictionary=True)

# データベース作成
create_table_query = """
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN
)
"""
cursor.execute(create_table_query)
cursor.close()
conn.close()

app = flask.Flask(__name__)

@app.route("/")
# def hi():
#     return 'hi'
def get():
    """test"""
    # MySQLに接続
    conn_g = mysql.connector.connect(host="db", user="user", password="pass", database="appdata")

    # カーソルを取得
    cursor_g = conn_g.cursor(dictionary=True)
    cursor_g.execute("""
SELECT *
FROM tasks
""")
    result = cursor_g.fetchall()#dict型
    cursor_g.close()
    conn_g.close()
    return result

@app.route("/update")
def update():
    """uptate data"""
    # MySQLに接続
    conn_u = mysql.connector.connect(host="db", user="user", password="pass", database="appdata")
    # カーソルを取得
    cursor_u = conn_u.cursor(dictionary=True)
    # task_id=flask.request.form.get("id", type=int)
    # title=flask.request.form.get("title")
    # completed=flask.request.form.get("completed")
    if flask.request.args.get("title"):
        ud_title=[flask.request.args.get("title"),flask.request.args.get("id",type=int)]
        update_title_query ="UPDATE tasks SET title = %s WHERE id = %s"
        cursor_u.execute(update_title_query, ud_title)
    if flask.request.args.get("completed"):
        ud_comp=[flask.request.args.get("completed"),flask.request.args.get("id",type=int)]
        update_completed_query ="UPDATE tasks SET completed = %s WHERE id = %s"
        cursor_u.execute(update_completed_query,ud_comp)
    conn_u.commit()
    # 接続を閉じる
    cursor_u.close()
    conn_u.close()
    return flask.redirect('/')#@app.route("/")へリダイレクト

@app.route("/insert")
def insert():
    """add task"""
    # MySQLに接続
    conn_i = mysql.connector.connect(host="db", user="user", password="pass", database="appdata")
    # カーソルを取得
    cursor_i = conn_i.cursor(dictionary=True)
    title=[flask.request.args.get("title")]
    # title=[flask.request.form.get("title")]
    if flask.request.args.get("title"):
        insert_query ="INSERT INTO tasks (title, completed) VALUES (%s, false)"
        cursor_i.execute(insert_query, title)
        conn_i.commit()
    # 接続を閉じる
    cursor_i.close()
    conn_i.close()
    return flask.redirect('/')#@app.route("/")へリダイレクト

@app.route("/delete")
def delete():
    """delete task"""
    # MySQLに接続
    conn_d = mysql.connector.connect(host="db", user="user", password="pass", database="appdata")
    # カーソルを取得
    cursor_d = conn_d.cursor(dictionary=True)
    task_id=[flask.request.args.get("id", type=int)]
    # task_id=flask.request.form.get("id", type=int)
    delete_query = "DELETE FROM tasks WHERE id = %s"
    cursor_d.execute(delete_query, task_id)
    conn_d.commit()
    cursor_d.close()
    conn_d.close()
    return flask.redirect('/')#@app.route("/")へリダイレクト


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
