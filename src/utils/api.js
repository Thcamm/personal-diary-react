import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function: Generate next ID
const generateNextId = async (endpoint) => {
  try {
    const response = await api.get(`/${endpoint}?_sort=id&_order=desc&_limit=1`);
    if (response.data.length === 0) {
      return "1";
    }
    const lastId = parseInt(response.data[0].id);
    return (lastId + 1).toString();
  } catch (err) {
    console.error('Error generating ID:', err);
    return Date.now().toString(); // Fallback to timestamp
  }
};

// Auth APIs
export const login = (username, password) => 
  api.get(`/users?username=${username}&password=${password}`);

export const register = async (userData) => {
  const newId = await generateNextId('users');
  return api.post('/users', { ...userData, id: newId });
};

// Diary APIs
export const getDiaries = (userId) => 
  api.get(`/diaries?userId=${userId}&_sort=createdAt&_order=desc`);

export const getPublicDiaries = () => 
  api.get('/diaries?isPublic=true&_sort=createdAt&_order=desc');

export const getDiaryById = (id) => 
  api.get(`/diaries/${id}`);

export const createDiary = async (diaryData) => {
  const newId = await generateNextId('diaries');
  return api.post('/diaries', { ...diaryData, id: newId });
};

export const updateDiary = (id, diaryData) => 
  api.patch(`/diaries/${id}`, diaryData);

export const deleteDiary = (id) => 
  api.delete(`/diaries/${id}`);

// Like APIs
export const getUserLikes = (userId) => 
  api.get(`/likes?userId=${userId}`);

export const checkUserLiked = (userId, diaryId) => 
  api.get(`/likes?userId=${userId}&diaryId=${diaryId}`);

export const likeDiary = async (userId, diaryId) => {
  const newId = await generateNextId('likes');
  
  await api.post('/likes', {
    id: newId,
    userId,
    diaryId,
    createdAt: new Date().toISOString()
  });
  
  const diary = await api.get(`/diaries/${diaryId}`);
  const currentLikes = diary.data.likes || 0;
  return api.patch(`/diaries/${diaryId}`, { likes: currentLikes + 1 });
};

export const unlikeDiary = async (userId, diaryId) => {
  const likeRecord = await api.get(`/likes?userId=${userId}&diaryId=${diaryId}`);
  
  if (likeRecord.data.length > 0) {
    await api.delete(`/likes/${likeRecord.data[0].id}`);
    
    const diary = await api.get(`/diaries/${diaryId}`);
    const currentLikes = diary.data.likes || 0;
    return api.patch(`/diaries/${diaryId}`, { likes: Math.max(0, currentLikes - 1) });
  }
};

// Comment APIs
export const getComments = (diaryId) => 
  api.get(`/comments?diaryId=${diaryId}&_sort=createdAt&_order=desc`);

export const addComment = async (commentData) => {
  const newId = await generateNextId('comments');
  return api.post('/comments', { ...commentData, id: newId });
};

export const deleteComment = (commentId) => 
  api.delete(`/comments/${commentId}`);

// User APIs
export const getUserById = (userId) =>
  api.get(`/users/${userId}`);