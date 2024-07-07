MongoDBシェルがインストールされていないようですので、MongoDBシェルをインストールする手順を説明します。

### 方法 1: MongoDBシェルのインストール

1. **MongoDBシェルのインストール**
   
   コンテナ内に `mongo` コマンドをインストールします。

```bash
kubectl exec -it <mongo-pod-name> -- /bin/bash
```

次に、コンテナ内で以下のコマンドを実行します。

```bash
apt-get update
apt-get install -y mongodb-clients
```

インストールが完了したら、再度MongoDBシェルを使用してデータベースの内容を確認します。

```bash
mongo
use taskdb
db.tasks.find().pretty()
```
MongoDBでテーブル（コレクション）を削除するには、以下の手順を実行します。ここでは、`tasks` コレクションを削除する方法を説明します。

### 1. ポートフォワーディングを設定する

まず、ローカルマシンからMongoDBにアクセスできるようにポートフォワーディングを設定します。

```bash
kubectl port-forward <mongo-pod-name> 27017:27017
```

### 2. MongoDBシェルからアクセスする

次に、ローカルマシンからMongoDBシェルを使用してアクセスします。

```bash
mongo --host localhost --port 27017
```

### 3. データベースとコレクションの選択

MongoDBシェルで以下のコマンドを実行して、`taskdb` データベースと `tasks` コレクションを選択します。

```javascript
use taskdb
show collections
```

### 4. コレクションの削除

`tasks` コレクションを削除するには、以下のコマンドを実行します。

```javascript
db.tasks.drop()
```

これで、`tasks` コレクションが削除されます。再度データを初期化したい場合は、アプリケーションを実行することで新しいデータを作成できます。

### コレクション削除後の確認

コレクションを削除した後、再度コレクションが存在しないことを確認するために以下のコマンドを実行します。

```javascript
show collections
```

`tasks` コレクションがリストに表示されていなければ、削除は成功しています。

### データベースの削除

もし `taskdb` データベース全体を削除したい場合は、以下のコマンドを実行します。

```javascript
db.dropDatabase()
```

これで、`taskdb` データベース全体が削除されます。

### 確認と再デプロイ

データベースやコレクションの削除が完了したら、アプリケーションを再デプロイして動作を確認します。

1. **gRPCサーバーの再ビルドと再デプロイ**

```bash
cd task-manager/server
docker build -t gcr.io/second-417514/my-grpc-server .
docker push gcr.io/second-417514/my-grpc-server
kubectl rollout restart deployment grpc-server
```

2. **Apollo Serverの再ビルドと再デプロイ**

```bash
cd task-manager/bff
docker build -t gcr.io/second-417514/my-apollo-server .
docker push gcr.io/second-417514/my-apollo-server
kubectl rollout restart deployment apollo-server
```

3. **Reactクライアントの再ビルドと再デプロイ**

```bash
cd task-manager/client
docker build -t gcr.io/second-417514/my-react-client .
docker push gcr.io/second-417514/my-react-client
kubectl rollout restart deployment react-client
```

再デプロイが完了したら、ブラウザでReactクライアントにアクセスし、新しいデータが正しく表示され、削除機能が動作するか確認してください。