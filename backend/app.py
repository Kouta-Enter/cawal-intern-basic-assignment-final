import flask
import mysql.connector

# MySQLに接続
conn = mysql.connector.connect(
    host="db",
    user="root",
    password="Passw@rd"
)

# カーソルを取得
cursor = conn.cursor(dictionary=True)
#Ubuntu 18.04 LTS
#Python 3.6.8
#MySQL Connector/Python 2.1.6で動作したとのことhttps://qiita.com/umezawatakeshi/items/7d7f4f8299e8d0d2db86


# データベース作成
cursor.execute("""CREATE DATABASE IF NOT EXISTS tasks
(    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN
)""")




app = flask.Flask(__name__)

@app.route("/")
def get():
    """test"""
    cursor.execute("""
SELECT *
FROM tasks
    """)
    result = cursor.fetchall()#dict型
    # 接続を閉じる
    cursor.close()
    conn.close()
    print(result)
    return result

@app.route("/PUT")
def put():
    """uptate data"""
    task_id=flask.request.form.get("id", type=int)
    title=flask.request.form.get("title")
    completed=flask.request.form.get("completed")
    if not title:
        update_title_query ="UPDATE tasks SET title = %s WHERE id = %s"
        cursor.execute(update_title_query, (task_id, title))
    if not completed:
        update_completed_query ="UPDATE tasks SET completed = %s WHERE id = %s"
        cursor.execute(update_completed_query, (id, completed))
        conn.commit()
    # 接続を閉じる
    cursor.close()
    conn.close()
    return flask.redirect('https://57.183.29.2:8000/')#@app.route("/")へリダイレクト

@app.route("/POST")
def post():
    """add task"""
    title=flask.request.form.get("title")
    if not title:
        insert_query ="INSERT INTO tasks (title, completed) VALUES (%s, false)"
        cursor.execute(insert_query, (title))
        conn.commit()
    # 接続を閉じる
    cursor.close()
    conn.close()
    return flask.redirect('https://57.183.29.2:8000/')#@app.route("/")へリダイレクト

@app.route("/DELETE")
def delete():
    """delete task"""
    task_id=flask.request.form.get("id", type=int)
    delete_query = "DELETE FROM tasks WHERE id = %s"
    cursor.execute(delete_query, (task_id))
    conn.commit()
    cursor.close()
    conn.close()
    return flask.redirect('https://57.183.29.2:8000/')#@app.route("/")へリダイレクト


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
