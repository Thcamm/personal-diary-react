import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Spinner, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import { PencilSquare, Trash, Eye, Globe, Lock, Heart } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

function MyDiaries() {
  const { user } = useAuth();
  const [diaries, setDiaries] = useState([]);
  const [filteredDiaries, setFilteredDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, public, private

  useEffect(() => {
    fetchDiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterDiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, diaries]);

  const fetchDiaries = async () => {
    try {
      const response = await api.getDiaries(user.id);
      // Sort theo ngày mới nhất
      const sortedDiaries = response.data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setDiaries(sortedDiaries);
      setFilteredDiaries(sortedDiaries);
    } catch (err) {
      toast.error('Không thể tải nhật ký!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterDiaries = () => {
    let result = [...diaries];

    // Filter by public/private
    if (filter === 'public') {
      result = result.filter(d => d.isPublic);
    } else if (filter === 'private') {
      result = result.filter(d => !d.isPublic);
    }

    setFilteredDiaries(result);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      try {
        await api.deleteDiary(id);
        setDiaries(diaries.filter(diary => diary.id !== id));
        toast.success('Đã xóa nhật ký!');
      } catch (err) {
        toast.error('Không thể xóa nhật ký!');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-white">Đang tải...</p>
      </Container>
    );
  }

  const stats = {
    total: diaries.length,
    public: diaries.filter(d => d.isPublic).length,
    private: diaries.filter(d => !d.isPublic).length,
    totalLikes: diaries.reduce((sum, d) => sum + (d.likes || 0), 0)
  };

  return (
    <Container className="py-4">
      {/* Compact Header */}
      <Card className="glass-card border-0 mb-4 fade-in">
        <Card.Body className="p-4">
          <Row className="align-items-center g-3">
            {/* Title */}
            <Col md={3}>
              <h4 className="mb-0">📚 Nhật ký của tôi</h4>
            </Col>

            {/* Filter */}
            <Col md={4}>
              <Form.Select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '10px 14px'
                }}
              >
                <option value="all">Tất cả ({stats.total})</option>
                <option value="public">Công khai ({stats.public})</option>
                <option value="private">Riêng tư ({stats.private})</option>
              </Form.Select>
            </Col>

            {/* Total Likes */}
            <Col md={3}>
              <div className="d-flex align-items-center gap-2">
                <Heart size={20} style={{ color: '#e74c3c' }} />
                <span className="fw-bold" style={{ color: '#e74c3c' }}>
                  {stats.totalLikes}
                </span>
                <span className="text-muted small">lượt thích</span>
              </div>
            </Col>

            {/* Write Button */}
            <Col md={2} className="text-end">
              <Button 
                as={Link} 
                to="/diary/new" 
                className="btn-gradient-primary w-100"
              >
                <PencilSquare size={16} className="me-2" />
                Viết mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Diaries List */}
      {filteredDiaries.length === 0 ? (
        <Card className="glass-card border-0 text-center p-5">
          <Card.Body>
            <h4>
              {filter !== 'all' 
                ? `Chưa có nhật ký ${filter === 'public' ? 'công khai' : 'riêng tư'} nào` 
                : 'Chưa có nhật ký nào'}
            </h4>
            <p className="text-muted">
              {filter !== 'all'
                ? 'Thử thay đổi bộ lọc để xem nhật ký khác'
                : 'Hãy bắt đầu viết nhật ký đầu tiên của bạn!'}
            </p>
            {filter === 'all' && (
              <Button as={Link} to="/diary/new" className="btn-gradient-primary mt-2">
                Viết ngay
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredDiaries.map((diary, index) => (
            <Col md={6} lg={4} key={diary.id} className="mb-4">
              <Card 
                className="glass-card hover-lift h-100 border-0 fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 flex-grow-1" style={{ fontSize: '1.1rem' }}>
                      {diary.title}
                    </Card.Title>
                    <Badge 
                      bg={diary.isPublic ? 'success' : 'secondary'}
                      className="ms-2 d-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {diary.isPublic ? <><Globe size={12} /> Công khai</> : <><Lock size={12} /> Riêng tư</>}
                    </Badge>
                  </div>
                  
                  <Card.Text className="text-muted small mb-2">
                    {new Date(diary.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Card.Text>
                  
                  <Card.Text 
                    className="mb-3"
                    style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '60px'
                    }}
                  >
                    {diary.content}
                  </Card.Text>

                  {/* Likes */}
                  {diary.isPublic && (
                    <div className="mb-3 text-muted small">
                      ❤️ {diary.likes || 0} lượt thích
                    </div>
                  )}
                </Card.Body>
                
                <Card.Footer className="bg-white border-top-0 p-3">
                  <div className="d-flex gap-2">
                    <Button 
                      as={Link} 
                      to={`/diary/${diary.id}`} 
                      variant="outline-primary" 
                      size="sm"
                      className="flex-grow-1"
                    >
                      <Eye size={16} className="me-1" />
                      Xem
                    </Button>
                    <Button 
                      as={Link} 
                      to={`/diary/edit/${diary.id}`} 
                      variant="outline-secondary" 
                      size="sm"
                    >
                      <PencilSquare size={16} />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(diary.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default MyDiaries;