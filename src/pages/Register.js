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

  // Validate username
  const validateUsername = (value) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(value);
  };

  // Validate email - CHẶT CHẼ
  const validateEmail = (value) => {
    // Regex cơ bản
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(value)) return false;
    
    // Kiểm tra thêm cấu trúc
    const parts = value.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domainPart] = parts;
    
    // Local part (trước @) phải có ít nhất 2 ký tự
    if (!localPart || localPart.length < 2) return false;
    
    // Domain phải có dấu chấm
    const domainParts = domainPart.split('.');
    if (domainParts.length < 2) return false;
    
    // Domain name và extension phải hợp lệ
    const domainName = domainParts[0];
    const extension = domainParts[domainParts.length - 1];
    
    // Domain name ít nhất 2 ký tự, extension ít nhất 2 ký tự
    if (domainName.length < 2 || extension.length < 2) return false;
    
    // Extension không được toàn số
    if (/^\d+$/.test(extension)) return false;
    
    return true;
  };

  // Validate password
  const validatePassword = (value) => {
    return value.length >= 6 && value.trim().length > 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Trim username để tránh khoảng trắng
    const trimmedValue = name === 'username' ? value.trim() : value;
    
    setFormData({
      ...formData,
      [name]: trimmedValue
    });

    // Clear error khi user đang nhập
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validateUsername(formData.username)) {
      setError('Tên đăng nhập không hợp lệ! Chỉ được dùng chữ cái, số, gạch dưới (_) và gạch ngang (-). Độ dài từ 3-20 ký tự.');
      toast.error('Tên đăng nhập không hợp lệ!');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Email không hợp lệ! Vui lòng nhập email đúng định dạng (ví dụ: user@example.com)');
      toast.error('Email không hợp lệ!');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Mật khẩu phải có ít nhất 6 ký tự và không được để trống!');
      toast.error('Mật khẩu không hợp lệ!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);

    try {
      // Check if username exists
      const checkUser = await api.api.get(`/users?username=${formData.username}`);
      if (checkUser.data.length > 0) {
        setError('Tên đăng nhập đã tồn tại!');
        toast.error('Tên đăng nhập đã tồn tại!');
        setLoading(false);
        return;
      }

      // Check if email exists
      const checkEmail = await api.api.get(`/users?email=${formData.email}`);
      if (checkEmail.data.length > 0) {
        setError('Email đã được sử dụng!');
        toast.error('Email đã được sử dụng!');
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
                maxLength={20}
                pattern="[a-zA-Z0-9_-]+"
                title="Chỉ được dùng chữ cái, số, gạch dưới (_) và gạch ngang (-)"
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
              <Form.Text className="text-muted">
                3-20 ký tự. Chỉ chữ cái, số, dấu _ và -
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
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px'
                }}
              />
              <Form.Text className="text-muted">
                Ví dụ: user@gmail.com, name@example.com
              </Form.Text>
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