import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import { PersonCircle, Lock } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username, password);
      
      if (response.data.length > 0) {
        const userData = response.data[0];
        login(userData);
        toast.success(`Chào mừng ${userData.username}!`);
        navigate('/');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        toast.error('Đăng nhập thất bại!');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      toast.error('Có lỗi xảy ra!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="glass-card border-0 fade-in" style={{ maxWidth: '450px', margin: '0 auto' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <div className="mb-3" style={{ color: '#667eea' }}>
              <PersonCircle size={60} />
            </div>
            <h2 className="fw-bold">Đăng nhập</h2>
            <p className="text-muted">Chào mừng bạn trở lại!</p>
          </div>
          
          {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <PersonCircle size={18} className="me-2" />
                Tên đăng nhập
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">
                <Lock size={18} className="me-2" />
                Mật khẩu
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
            </Form.Group>

            <Button 
              type="submit" 
              className="btn-gradient-primary w-100 mb-3"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>

            <div className="text-center">
              <small className="text-muted">
                Chưa có tài khoản?{' '}
                <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
                  Đăng ký ngay
                </Link>
              </small>
            </div>
          </Form>

          <Card className="mt-4 border-0" style={{ background: '#f8f9fa' }}>
            <Card.Body className="p-3 text-center">
              <small className="text-muted">
                <strong>Demo Account:</strong><br />
                Username: <code>thcamm</code><br />
                Password: <code>123456</code>
              </small>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;