import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const login = (username, password) => 
  api.get(`/users?username=${username}&password=${password}`);

export const register = (userData) => 
  api.post('/users', userData);

// Diary APIs
export const getDiaries = (userId) => 
  api.get(`/diaries?userId=${userId}&_sort=createdAt&_order=desc`);

export const getPublicDiaries = () => 
  api.get('/diaries?isPublic=true&_sort=createdAt&_order=desc');

export const getDiaryById = (id) => 
  api.get(`/diaries/${id}`);

export const createDiary = (diaryData) => 
  api.post('/diaries', diaryData);

export const updateDiary = (id, diaryData) => 
  api.patch(`/diaries/${id}`, diaryData);

export const deleteDiary = (id) => 
  api.delete(`/diaries/${id}`);

// Like APIs
export const likeDiary = async (diaryId) => {
  const diary = await api.get(`/diaries/${diaryId}`);
  const currentLikes = diary.data.likes || 0;
  return api.patch(`/diaries/${diaryId}`, { likes: currentLikes + 1 });
};

export const unlikeDiary = async (diaryId) => {
  const diary = await api.get(`/diaries/${diaryId}`);
  const currentLikes = diary.data.likes || 0;
  return api.patch(`/diaries/${diaryId}`, { likes: Math.max(0, currentLikes - 1) });
};

// Comment APIs
export const getComments = (diaryId) => 
  api.get(`/comments?diaryId=${diaryId}&_sort=createdAt&_order=desc`);

export const addComment = (commentData) => 
  api.post('/comments', commentData);

export const deleteComment = (commentId) => 
  api.delete(`/comments/${commentId}`);

// User APIs
export const getUserById = (userId) =>
  api.get(`/users/${userId}`);