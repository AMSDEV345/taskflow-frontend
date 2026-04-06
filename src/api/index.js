import axios from 'axios';

const API = axios.create({
  baseURL: 'https://taskflow-backend-production-1ee5.up.railway.app/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => API.post(`/auth/reset-password/${token}`, data);

// Boards
export const getBoards = () => API.get('/boards');
export const createBoard = (data) => API.post('/boards', data);
export const updateBoard = (id, data) => API.put(`/boards/${id}`, data);
export const deleteBoard = (id) => API.delete(`/boards/${id}`);

// Lists
export const addList = (boardId, data) => API.post(`/boards/${boardId}/lists`, data);
export const updateList = (boardId, listId, data) => API.put(`/boards/${boardId}/lists/${listId}`, data);
export const deleteList = (boardId, listId) => API.delete(`/boards/${boardId}/lists/${listId}`);

// Tasks
export const addTask = (boardId, listId, data) => API.post(`/boards/${boardId}/lists/${listId}/tasks`, data);
export const updateTask = (boardId, listId, taskId, data) => API.put(`/boards/${boardId}/lists/${listId}/tasks/${taskId}`, data);
export const deleteTask = (boardId, listId, taskId) => API.delete(`/boards/${boardId}/lists/${listId}/tasks/${taskId}`);
export const moveTask = (boardId, taskId, data) => API.put(`/boards/${boardId}/tasks/${taskId}/move`, data);

// Comments
export const addComment = (boardId, listId, taskId, data) => API.post(`/boards/${boardId}/lists/${listId}/tasks/${taskId}/comments`, data);

// Users
export const getUsers = () => API.get('/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/users/${id}`);