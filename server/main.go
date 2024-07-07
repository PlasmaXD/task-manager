package main

import (
	"context"
	"fmt"
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
	log.Printf("Received create task with due date: %s", task.DueDate)

	document := bson.M{
		"id":          task.Id,
		"title":       task.Title,
		"description": task.Description,
		"status":      task.Status,
		"due_date":    task.DueDate,
	}

	_, err := taskCollection.InsertOne(ctx, document)
	if err != nil {
		return nil, err
	}

	return &pb.CreateTaskResponse{Task: task}, nil
}

func (s *server) GetTasks(ctx context.Context, req *pb.GetTasksRequest) (*pb.GetTasksResponse, error) {
	cursor, err := taskCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("Error finding tasks: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []*pb.Task
	for cursor.Next(ctx) {
		var document bson.M
		if err := cursor.Decode(&document); err != nil {
			log.Printf("Error decoding task document: %v", err)
			return nil, err
		}
		task := &pb.Task{
			Id:          document["id"].(string),
			Title:       document["title"].(string),
			Description: document["description"].(string),
			Status:      document["status"].(string),
			DueDate:     document["due_date"].(string), // ここを追加
		}
		tasks = append(tasks, task)
	}
	if err := cursor.Err(); err != nil {
		log.Printf("Cursor error: %v", err)
		return nil, err
	}

	log.Printf("Fetched tasks: %v", tasks)
	return &pb.GetTasksResponse{Tasks: tasks}, nil
}

func (s *server) UpdateTask(ctx context.Context, req *pb.UpdateTaskRequest) (*pb.UpdateTaskResponse, error) {
	task := req.Task
	filter := bson.M{"id": task.Id}
	update := bson.M{"$set": bson.M{
		"title":       task.Title,
		"description": task.Description,
		"status":      task.Status,
		"due_date":    task.DueDate,
	}}
	_, err := taskCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}
	return &pb.UpdateTaskResponse{Task: task}, nil
}

func (s *server) DeleteTask(ctx context.Context, req *pb.DeleteTaskRequest) (*pb.DeleteTaskResponse, error) {
	log.Printf("Received delete request for task ID: %s", req.Id)
	filter := bson.M{"id": req.Id}
	res, err := taskCollection.DeleteOne(ctx, filter)
	if err != nil {
		log.Printf("Error deleting task: %v", err)
		return nil, err
	}
	if res.DeletedCount == 0 {
		log.Printf("No task found with ID: %v", req.Id)
		return nil, fmt.Errorf("No task found with ID: %v", req.Id)
	}
	log.Printf("Deleted task with ID: %v", req.Id)
	return &pb.DeleteTaskResponse{Id: req.Id}, nil
}

func main() {
	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
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
