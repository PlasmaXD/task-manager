import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

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
      await deleteTask({ variables: { id } });
      refetch();
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <button onClick={handleCreateTask}>Create Task</button>
      <ul>
        {data && data.tasks && data.tasks.map((task) => (
          <li key={task.id}>
            {task.title} - {task.description} - {task.status} - {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
