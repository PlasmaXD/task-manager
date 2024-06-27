# ベースイメージ
FROM node:14

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# ビルド
RUN npm run build

# サーバーの設定
RUN npm install -g serve

# ポートを開放
EXPOSE 3000

# コンテナ起動時に実行されるコマンド
CMD ["serve", "-s", "build"]
