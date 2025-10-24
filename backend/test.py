import mysql.connector

# MySQLに接続
conn = mysql.connector.connect(
    host="db", user="user", password="pass", database="appdata"
)

# カーソルを取得
cursor = conn.cursor(dictionary=True)
# Ubuntu 18.04 LTS
# Python 3.6.8
# MySQL Connector/Python 2.1.6で動作したとのことhttps://qiita.com/umezawatakeshi/items/7d7f4f8299e8d0d2db86


# データベース作成
create_table_query = """
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN
)
"""
cursor.execute(create_table_query)
# 接続を閉じる
title = []
title.append("test1")
if title:
    insert_query = "INSERT INTO tasks (title, completed) VALUES (%s, false)"
    cursor.execute(insert_query, title)
    conn.commit()
print("test")
cursor.execute(
    """
SELECT *
FROM tasks
"""
)
result = cursor.fetchall()  # dict型
print(result)
cursor.close()
conn.close()
