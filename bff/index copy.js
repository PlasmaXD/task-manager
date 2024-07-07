const { ApolloServer } = require('@apollo/server');
const { gql } = require('graphql-tag');
const express = require('express');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'task.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const taskProto = grpc.loadPackageDefinition(packageDefinition).task;

const client = new taskProto.TaskService('grpc-server:50051', grpc.credentials.createInsecure());

const typeDefs = gql`
  type Task {
    id: ID!
    title: String
    title: String
    description: String
    status: String
    due_date: String
  }

  type Query {
    tasks: [Task]
  }

  type Mutation {
    createTask(title: String!, description: String, status: String, due_date: String): Task
    updateTask(id: ID!, title: String, description: String, status: String, due_date: String): Task
    deleteTask(id: ID!): ID
  }
`;

const resolvers = {
  Query: {
    tasks: async () => {
      return new Promise((resolve, reject) => {
        client.GetTasks({}, (error, response) => {
          if (error) {
            console.error('Error fetching tasks:', error);
            reject(error);
          } else {
            console.log('Fetched tasks:', response.tasks);
            resolve(response.tasks);
          }
        });
      });
    }
  },
  Mutation: {
    createTask: async (_, { title, description, status, due_date }) => {
      console.log(`Create Task: title=${title}, description=${description}, status=${status}, due_date=${due_date}`);
      return new Promise((resolve, reject) => {
        const task = { title, description, status, due_date };
        client.CreateTask({ task }, (error, response) => {
          if (error) {
            console.error('Error creating task:', error);
            reject(error);
          } else {
            console.log('Created task:', response.task);
            resolve(response.task);
          }
        });
      });
    },
    updateTask: async (_, { id, title, description, status, due_date }) => {
      console.log(`Update Task: id=${id}, title=${title}, description=${description}, status=${status}, due_date=${due_date}`);
      return new Promise((resolve, reject) => {
        const task = { id, title, description, status, due_date };
        client.UpdateTask({ task }, (error, response) => {
          if (error) {
            console.error('Error updating task:', error);
            reject(error);
          } else {
            console.log('Updated task:', response.task);
            resolve(response.task);
          }
        });
      });
    },
    deleteTask: async (_, { id }) => {
      console.log(`Delete Task: id=${id}`);
      return new Promise((resolve, reject) => {
        client.DeleteTask({ id }, (error, response) => {
          if (error) {
            console.error('Error deleting task:', error);
            reject(error);
          } else {
            console.log('Deleted task ID:', response.id);
            resolve(response.id);
          }
        });
      });
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
app.use(cors());
server.start().then(() => {
  app.use('/graphql', bodyParser.json(), expressMiddleware(server));
  app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000/graphql');
  });
});
