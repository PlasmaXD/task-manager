package main

import (
	"context"
	"log"
	"net"
	"time"

	pb "task-manager/pb"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

var taskCollection *mongo.Collection

type server struct {
	pb.UnimplementedTaskServiceServer
}

func (s *server) CreateTask(ctx context.Context, req *pb.CreateTaskRequest) (*pb.CreateTaskResponse, error) {
	task := req.Task
	task.Id = time.Now().Format("20060102150405") // タスクに一意のIDを設定
	_, err := taskCollection.InsertOne(ctx, task)
	if err != nil {
		return nil, err
	}
	return &pb.CreateTaskResponse{Task: task}, nil
}

func (s *server) GetTasks(ctx context.Context, req *pb.GetTasksRequest) (*pb.GetTasksResponse, error) {
	cursor, err := taskCollection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []*pb.Task
	for cursor.Next(ctx) {
		var task pb.Task
		if err := cursor.Decode(&task); err != nil {
			return nil, err
		}
		tasks = append(tasks, &task)
	}

	return &pb.GetTasksResponse{Tasks: tasks}, nil
}

func (s *server) UpdateTask(ctx context.Context, req *pb.UpdateTaskRequest) (*pb.UpdateTaskResponse, error) {
	task := req.Task
	filter := bson.M{"id": task.Id}
	update := bson.M{"$set": task}
	_, err := taskCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}
	return &pb.UpdateTaskResponse{Task: task}, nil
}

func (s *server) DeleteTask(ctx context.Context, req *pb.DeleteTaskRequest) (*pb.DeleteTaskResponse, error) {
	filter := bson.M{"id": req.Id}
	_, err := taskCollection.DeleteOne(ctx, filter)
	if err != nil {
		return nil, err
	}
	return &pb.DeleteTaskResponse{Id: req.Id}, nil
}

func main() {
	clientOptions := options.Client().ApplyURI("mongodb://mongo:27017")
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	taskCollection = client.Database("taskdb").Collection("tasks")

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterTaskServiceServer(s, &server{})
	reflection.Register(s)

	log.Println("Server is running on port 50051...")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
