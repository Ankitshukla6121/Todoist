import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/tasks`);
            setTasks(response.data);
            setError(null);
        } catch (error) {
            setError('Failed to fetch tasks: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (editingTask) {
                // Update existing task
                await axios.put(`${API_BASE_URL}/tasks/${editingTask._id}`, {
                    title,
                    description
                });
                setEditingTask(null);  // Reset editing task after update
            } else {
                // Add new task
                await axios.post(`${API_BASE_URL}/tasks`, {
                    title,
                    description
                });
            }

            // Clear input fields
            setTitle('');
            setDescription('');
            await fetchTasks();  // Refresh task list after adding or updating a task
        } catch (error) {
            setError('Failed to save task: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description);
    };

    const handleDelete = async (taskId) => {
        try {
            if (!window.confirm('Are you sure you want to delete this task?')) {
                return;
            }

            setLoading(true);
            setError(null);

            const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
            
            if (response.data.message === 'Task deleted successfully') {
                setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
                setError(null);  // Clear any previous error on successful deletion
            }
        } catch (error) {
            console.error('Delete error:', error);
            setError('Failed to delete task: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            setLoading(true);
            setError(null);

            const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
            await axios.put(`${API_BASE_URL}/tasks/${id}`, {
                status: newStatus
            });

            await fetchTasks();  // Refresh task list after status update
        } catch (error) {
            setError('Failed to update status: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingTask(null);
        setTitle('');
        setDescription('');
    };

    return (
        <div className="App">
            <h1>Todoist</h1>
            
            {error && (
                <div className="error-message">
                    {error}
                    <button 
                        className="error-close"
                        onClick={() => setError(null)}
                    >
                        ×
                    </button>
                </div>
            )}
            
            {loading && <div className="loading-message">Processing...</div>}

            <form onSubmit={handleSubmit} className="task-form">
                <input
                    type="text"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="form-input"
                />
                <textarea
                    placeholder="Task Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="form-textarea"
                />
                <div className="form-buttons">
                    <button type="submit" className="submit-button">
                        {editingTask ? 'Update Task' : 'Add Task'}
                    </button>
                    {editingTask && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="tasks-container">
                {tasks.length === 0 ? (
                    <p className="no-tasks">No tasks available. Add a new task to get started!</p>
                ) : (
                    tasks.map(task => (
                        <div key={task._id} className={`task-card ${task.status}`}>
                            <h3 className="task-title">{task.title}</h3>
                            <p className="task-description">{task.description}</p>
                            <div className="task-actions">
                                <button
                                    onClick={() => toggleStatus(task._id, task.status)}
                                    className="status-button"
                                >
                                    {task.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                                </button>
                                <button
                                    onClick={() => handleEdit(task)}
                                    className="edit-button"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(task._id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                            <span className="task-status">
                                Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;
