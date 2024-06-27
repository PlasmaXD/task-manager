# ベースイメージ
FROM golang:1.20

# 作業ディレクトリの設定
WORKDIR /app

# 必要なツールのインストール
RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    git

# Protocのインストール
RUN curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v3.19.1/protoc-3.19.1-linux-x86_64.zip && \
    unzip protoc-3.19.1-linux-x86_64.zip -d /usr/local && \
    rm protoc-3.19.1-linux-x86_64.zip

# Goのプロトコルバッファプラグインのインストール
RUN go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.26
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.1

# Goモジュールとプロトコルバッファファイルをコピー
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# プロトコルバッファファイルの生成
RUN /usr/local/bin/protoc --go_out=. --go-grpc_out=. task.proto

# アプリケーションのビルド
RUN go build -o main .

# ポートを開放
EXPOSE 50051

# コンテナ起動時に実行されるコマンド
CMD ["./main"]
