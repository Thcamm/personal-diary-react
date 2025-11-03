import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import { Save, X, Globe, Lock } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

function DiaryForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchDiary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDiary = async () => {
    try {
      const response = await api.getDiaryById(id);
      const diary = response.data;
      
      if (diary.userId !== user.id) {
        toast.error('Bạn không có quyền chỉnh sửa bài này!');
        navigate('/my-diaries');
        return;
      }
      
      setTitle(diary.title);
      setContent(diary.content);
      setIsPublic(diary.isPublic);
    } catch (err) {
      setError('Không thể tải nhật ký!');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const diaryData = {
      title,
      content,
      isPublic,
      userId: user.id,
      updatedAt: new Date().toISOString()
    };

    // CHỈ THÊM createdAt và likes KHI TẠO MỚI
    if (!id) {
      diaryData.createdAt = new Date().toISOString();
      diaryData.likes = 0;
    }

    try {
      if (id) {
        await api.updateDiary(id, diaryData);
        toast.success('Đã cập nhật nhật ký!');
      } else {
        await api.createDiary(diaryData);
        toast.success('Đã tạo nhật ký mới!');
      }
      navigate('/my-diaries');
    } catch (err) {
      setError('Không thể lưu nhật ký. Vui lòng thử lại!');
      toast.error('Có lỗi xảy ra!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <Container className="py-4">
      <Card className="glass-card border-0 fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Card.Body className="p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              {id ? '✏️ Sửa nhật ký' : '✍️ Viết nhật ký mới'}
            </h2>
            <Badge bg={isPublic ? 'success' : 'secondary'} className="p-2">
              {isPublic ? <><Globe size={16} className="me-1" /> Công khai</> : <><Lock size={16} className="me-1" /> Riêng tư</>}
            </Badge>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề nhật ký..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '1.1rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={12}
                placeholder="Viết gì đó về ngày hôm nay..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ 
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '1rem',
                  lineHeight: '1.6'
                }}
              />
              <div className="d-flex justify-content-between mt-2">
                <small className="text-muted">
                  {wordCount} từ · {charCount} ký tự
                </small>
                <small className="text-muted">
                  {content.length > 0 ? `${Math.ceil(content.length / 500)} phút đọc` : ''}
                </small>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Card className="border-0" style={{ background: '#f8f9fa' }}>
                <Card.Body className="p-3">
                  <Form.Check
                    type="switch"
                    id="isPublic"
                    label={
                      <div>
                        <strong>{isPublic ? 'Công khai' : 'Riêng tư'}</strong>
                        <p className="mb-0 small text-muted">
                          {isPublic 
                            ? 'Mọi người có thể xem và bình luận trên bài viết này' 
                            : 'Chỉ bạn có thể xem bài viết này'}
                        </p>
                      </div>
                    }
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    style={{ fontSize: '1.1rem' }}
                  />
                </Card.Body>
              </Card>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                className="btn-gradient-primary flex-grow-1"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} className="me-2" />
                    {id ? 'Cập nhật' : 'Tạo mới'}
                  </>
                )}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/my-diaries')}
                size="lg"
              >
                <X size={18} className="me-1" />
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default DiaryForm;