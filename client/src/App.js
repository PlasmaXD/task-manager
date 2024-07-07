import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const GET_TASKS = gql`
  query GetTasks {
    tasks {
      id
      title
      description
      status
      due_date
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String, $status: String, $due_date: String) {
    createTask(title: $title, description: $description, status: $status, due_date: $due_date) {
      id
      title
      description
      status
      due_date
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

const App = () => {
  const { loading, error, data, refetch } = useQuery(GET_TASKS);
  const [createTask] = useMutation(CREATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [dueDate, setDueDate] = useState('');

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error('Error fetching tasks:', error);
    return <p>Error fetching tasks: {error.message}</p>;
  }

  const handleCreateTask = async () => {
    try {
      await createTask({ variables: { title, description, status, due_date: dueDate || null } });
      refetch();
    } catch (e) {
      console.error('Error creating task:', e);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      console.log(`Deleting task with ID: ${id}`);
      await deleteTask({ variables: { id } });
      refetch();
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Task Manager</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          className="form-control mb-2"
          placeholder="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleCreateTask}>Create Task</button>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Task</th>
            <th>詳細</th>
            <th>Deadline</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {data && data.tasks && data.tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>

              <td>{new Date(task.status).toLocaleDateString()}</td>

              <td>
                <button className="btn btn-danger" onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
