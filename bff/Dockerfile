# ベースイメージ
FROM node:14

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコピー
COPY . .

# ポートを開放
EXPOSE 4000

# コンテナ起動時に実行されるコマンド
CMD ["node", "index.js"]
