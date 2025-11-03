import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyDiaries from './pages/MyDiaries';
import DiaryForm from './pages/DiaryForm';
import DiaryDetail from './pages/DiaryDetail';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/my-diaries" element={
              <PrivateRoute><MyDiaries /></PrivateRoute>
            } />
            <Route path="/diary/new" element={
              <PrivateRoute><DiaryForm /></PrivateRoute>
            } />
            <Route path="/diary/edit/:id" element={
              <PrivateRoute><DiaryForm /></PrivateRoute>
            } />
            <Route path="/diary/:id" element={<DiaryDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;