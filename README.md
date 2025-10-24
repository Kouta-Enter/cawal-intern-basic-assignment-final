# cawal-intern-basic-assignment-final
- チケットのリンク:https://www.notion.so/IT-24e5b4c85029815b9436e4db0ccda8bf?source=copy_link
- 課題のリンク:https://www.notion.so/IT-Final-1cd5b4c8502980b383a0da98399f0a0c?source=copy_link
## 概要

- 研修課題
    - 簡単なタスク管理アプリを作成する。
        - 構成
            - SPA（フロントエンドとAPIサーバ）
    - 仕様
        - ユーザーはブラウザ経由で、タスクを追加、一覧表示、更新、削除できる。
    - その他
        - 画面設計、全体設計(ローカル環境のみ）、draw.ioを用いること
        - 設計後に設計レビュー依頼を行ってください
        - マルチコンテナ構成（DBとバックエンドを分ける）にすること
        - README.mdを作成し、資料をdocs/配下に配置、セットアップ手順を記載すること
        - REACTのフロントエンドはnodejsのサーバからそのままサーブする形にすること(ビルド不要）
        - 仕様等の詳細については、適宜、質問、ヒアリングを行ってください
- 使用技術
    - フロントエンド
        - React
    - バックエンド
        - Python (Flask)
    - データベース
        - MySQL
    - Docker
    - NodeJS

## 設計（DB）

- tasks テーブル
    - id: INT (主キー, 自動増分)
    - title: VARCHAR(255)
    - completed: BOOLEAN
## セットアップ手順
- ターミナルのこのファイルがあるディレクトリにて`docker-compose up`を実行します。
- しばらく待つと

```
ui-1   | > frontend@0.0.0 dev
ui-1   | > vite
ui-1   | 
6:37:04 AM [vite] (client) Re-optimizing dependencies because vite config has changed
ui-1   | 
ui-1   |   VITE v7.1.9  ready in 653 ms
ui-1   | 
ui-1   |   ➜  Local:   http://localhost:5173/
ui-1   |   ➜  Network: http://172.20.0.4:5173/
ui-1   |   ➜  press h + enter to show help
```
このような出力が出ます。
この状態でhttp://{このアプリを動かしているIPアドレス}:5173にアクセスするとタスクマネージャーを使うことができます。