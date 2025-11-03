import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { PersonPlus, PersonCircle, Lock, Envelope } from 'react-bootstrap-icons';
import * as api from '../utils/api';
import { toast } from 'react-toastify';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      // Check if username exists
      const checkUser = await api.api.get(`/users?username=${formData.username}`);
      if (checkUser.data.length > 0) {
        setError('Tên đăng nhập đã tồn tại!');
        setLoading(false);
        return;
      }

      // Check if email exists
      const checkEmail = await api.api.get(`/users?email=${formData.email}`);
      if (checkEmail.data.length > 0) {
        setError('Email đã được sử dụng!');
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        avatar: `https://ui-avatars.com/api/?name=${formData.username}&background=667eea&color=fff`,
        createdAt: new Date().toISOString()
      };

      await api.register(newUser);
      toast.success('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại!');
      toast.error('Đăng ký thất bại!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="glass-card border-0 fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <div className="mb-3" style={{ color: '#667eea' }}>
              <PersonPlus size={60} />
            </div>
            <h2 className="fw-bold">Đăng ký tài khoản</h2>
            <p className="text-muted">Tạo tài khoản mới để bắt đầu!</p>
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
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
              <Form.Text className="text-muted">
                Tối thiểu 3 ký tự
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <Envelope size={18} className="me-2" />
                Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                <Lock size={18} className="me-2" />
                Mật khẩu
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
              <Form.Text className="text-muted">
                Tối thiểu 6 ký tự
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">
                <Lock size={18} className="me-2" />
                Xác nhận mật khẩu
              </Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <PersonPlus size={20} className="me-2" />
                  Đăng ký
                </>
              )}
            </Button>

            <div className="text-center">
              <small className="text-muted">
                Đã có tài khoản?{' '}
                <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }}>
                  Đăng nhập ngay
                </Link>
              </small>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;