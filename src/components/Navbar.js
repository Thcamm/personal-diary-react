import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, Button } from 'react-bootstrap';
import { PersonCircle, JournalText, House, PencilSquare, BoxArrowRight } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BSNavbar 
      sticky="top"
      expand="lg" 
      className="shadow-sm"
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000
      }}
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold" style={{ color: '#667eea', fontSize: '1.5rem' }}>
          <JournalText size={28} className="me-2" />
          Nhật Ký Cá Nhân
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-2">
              <House size={18} />
              Trang chủ
            </Nav.Link>
            
            {user ? (
              <>
                <Nav.Link as={Link} to="/my-diaries" className="d-flex align-items-center gap-2">
                  <JournalText size={18} />
                  Nhật ký của tôi
                </Nav.Link>
                <Nav.Link as={Link} to="/diary/new" className="d-flex align-items-center gap-2">
                  <PencilSquare size={18} />
                  Viết mới
                </Nav.Link>
                <div className="d-flex align-items-center gap-2 ms-3">
                  <PersonCircle size={24} style={{ color: '#667eea' }} />
                  <span className="text-muted small">{user.username}</span>
                </div>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="ms-2 d-flex align-items-center gap-2"
                  onClick={handleLogout}
                >
                  <BoxArrowRight size={16} />
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button 
                as={Link} 
                to="/login" 
                className="btn-gradient-primary ms-2"
                size="sm"
              >
                <PersonCircle size={18} className="me-1" />
                Đăng nhập
              </Button>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;