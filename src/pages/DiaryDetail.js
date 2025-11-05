import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import { Heart, HeartFill, ChatDots, Send, PersonCircle, Lock, Globe, Trash } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';

function DiaryDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [diary, setDiary] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  
  const [commentName, setCommentName] = useState('username');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiaryAndComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDiaryAndComments = async () => {
    try {
      const [diaryRes, commentsRes] = await Promise.all([
        api.getDiaryById(id),
        api.getComments(id)
      ]);
      
      setDiary(diaryRes.data);
      setComments(commentsRes.data);

      const authorRes = await api.getUserById(diaryRes.data.userId);
      setAuthor(authorRes.data);
      
    } catch (err) {
      setError('Không thể tải nhật ký!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để like!');
      navigate('/login');
      return;
    }

    // Owner can like even private posts to see the count
    try {
      if (isLiked) {
        await api.unlikeDiary(id);
        setIsLiked(false);
        setDiary({ ...diary, likes: (diary.likes || 0) - 1 });
      } else {
        await api.likeDiary(id);
        setIsLiked(true);
        setDiary({ ...diary, likes: (diary.likes || 0) + 1 });
      }
    } catch (err) {
      toast.error('Không thể like!');
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.warning('Vui lòng đăng nhập để bình luận!');
      navigate('/login');
      return;
    }

    // Only owner can comment on private posts
    if (!diary.isPublic && user.id !== diary.userId) {
      toast.error('Không thể bình luận trên bài viết riêng tư!');
      return;
    }

    setSubmitting(true);

    const displayName = commentName === 'username' ? user.username : 'Anonymous';

    const commentData = {
      diaryId: id,
      userId: commentName === 'username' ? user.id : null, // Track user if not anonymous
      guestName: displayName,
      content: commentContent,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await api.addComment(commentData);
      setComments([response.data, ...comments]);
      setCommentContent('');
      toast.success('Đã thêm bình luận!');
    } catch (err) {
      toast.error('Không thể thêm bình luận!');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId, commentUserId) => {
    // Can delete if: 1) You wrote it, OR 2) You own the post
    const canDelete = (user && commentUserId && commentUserId === user.id) || (user && user.id === diary.userId);
    
    if (!canDelete) {
      toast.error('Bạn không có quyền xóa bình luận này!');
      return;
    }

    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      try {
        await api.deleteComment(commentId);
        setComments(comments.filter(c => c.id !== commentId));
        toast.success('Đã xóa bình luận!');
      } catch (err) {
        toast.error('Không thể xóa bình luận!');
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

  if (error || !diary) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || 'Không tìm thấy nhật ký!'}</Alert>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Container>
    );
  }

  const canView = diary.isPublic || (user && user.id === diary.userId);
  const isOwner = user && user.id === diary.userId;

  if (!canView) {
    return (
      <Container className="py-4">
        <Card className="glass-card border-0">
          <Card.Body className="text-center p-5">
            <Lock size={60} style={{ color: '#868f96' }} className="mb-3" />
            <h4>Nhật ký này ở chế độ riêng tư</h4>
            <p className="text-muted">Bạn không có quyền xem nội dung này!</p>
            <Button onClick={() => navigate('/')} className="btn-gradient-primary mt-3">
              Quay về trang chủ
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '800px' }}>
      {/* Diary Card */}
      <Card className="glass-card border-0 mb-4 fade-in">
        <Card.Body className="p-4 p-md-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-3 mb-2">
                <img 
                  src={author?.avatar || `https://ui-avatars.com/api/?name=${author?.username}&background=667eea&color=fff`}
                  alt={author?.username}
                  className="rounded-circle"
                  width={50}
                  height={50}
                />
                <div>
                  <h6 className="mb-0">{author?.username || 'User'}</h6>
                  <small className="text-muted">
                    {new Date(diary.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </small>
                </div>
              </div>
              <h2 className="mb-0">{diary.title}</h2>
            </div>
            <Badge 
              bg={diary.isPublic ? 'success' : 'secondary'}
              className="d-flex align-items-center gap-1"
              style={{ fontSize: '0.9rem', padding: '8px 14px' }}
            >
              {diary.isPublic ? (
                <>
                  <Globe size={16} />
                  Công khai
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Riêng tư
                </>
              )}
            </Badge>
          </div>

          {/* Content */}
          <Card.Text style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1.05rem' }}>
            {diary.content}
          </Card.Text>

          {/* Actions - Show stats for both public and private (if owner) */}
          <div className="d-flex align-items-center gap-4 mt-4 pt-4 border-top">
            {(diary.isPublic || isOwner) && (
              <>
                <Button 
                  variant="link" 
                  className="text-decoration-none p-0 d-flex align-items-center gap-2"
                  onClick={handleLike}
                  disabled={!diary.isPublic && !isOwner}
                >
                  {isLiked ? (
                    <HeartFill size={24} style={{ color: '#e74c3c' }} />
                  ) : (
                    <Heart size={24} style={{ color: '#666' }} />
                  )}
                  <span style={{ color: isLiked ? '#e74c3c' : '#666', fontSize: '1.1rem' }}>
                    {diary.likes || 0}
                  </span>
                </Button>

                <div className="d-flex align-items-center gap-2 text-muted">
                  <ChatDots size={24} />
                  <span style={{ fontSize: '1.1rem' }}>{comments.length}</span>
                </div>
              </>
            )}

            {!diary.isPublic && isOwner && (
              <Badge bg="warning" text="dark" className="ms-auto">
                Chỉ bạn thấy likes & comments
              </Badge>
            )}
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="d-flex gap-2 mt-4 pt-4 border-top">
              <Button 
                as={Link} 
                to={`/diary/edit/${diary.id}`} 
                className="btn-gradient-primary"
              >
                 Sửa
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/')}
              >
                Quay lại
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Comments Section - Show for: 1) Public posts, OR 2) Owner viewing private */}
      {(diary.isPublic || isOwner) && (
        <Card className="glass-card border-0 fade-in">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">
                <ChatDots size={28} className="me-2" />
                Bình luận ({comments.length})
              </h4>
              {!diary.isPublic && isOwner && (
                <Badge bg="warning" text="dark">
                  <Lock size={14} className="me-1" />
                  Chế độ riêng tư
                </Badge>
              )}
            </div>

            {/* Add Comment Form */}
            {user && (diary.isPublic || isOwner) && (
              <Form onSubmit={handleAddComment} className="mb-4">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Hiển thị tên</Form.Label>
                  <Form.Select
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    style={{ 
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px',
                      padding: '10px 14px'
                    }}
                  >
                    <option value="username">
                      {user.username} (Tên của bạn)
                    </option>
                    <option value="anonymous">
                      Anonymous (Ẩn danh)
                    </option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Nội dung bình luận</Form.Label>
                  <InputGroup>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Viết bình luận của bạn..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                      style={{ 
                        border: '2px solid #e0e0e0',
                        borderRadius: '10px',
                        padding: '12px'
                      }}
                    />
                  </InputGroup>
                </Form.Group>

                <Button 
                  type="submit" 
                  className="btn-gradient-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send size={16} className="me-2" />
                      Gửi bình luận
                    </>
                  )}
                </Button>
              </Form>
            )}

            {!user && diary.isPublic && (
              <Card className="border-0 mb-4" style={{ background: '#f8f9fa' }}>
                <Card.Body className="text-center p-4">
                  <PersonCircle size={40} style={{ color: '#667eea' }} className="mb-2" />
                  <p className="mb-3">Bạn cần đăng nhập để bình luận</p>
                  <Button 
                    as={Link}
                    to="/login"
                    className="btn-gradient-primary"
                  >
                    Đăng nhập
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center p-5" style={{ background: '#f8f9fa', borderRadius: '10px' }}>
                <ChatDots size={50} style={{ color: '#ccc' }} className="mb-3" />
                <p className="text-muted mb-0">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <div>
                {comments.map(comment => {
                  const canDeleteComment = (user && comment.userId && comment.userId === user.id) || isOwner;
                  
                  return (
                    <Card key={comment.id} className="mb-3 border-0 hover-lift" style={{ background: '#f8f9fa' }}>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <PersonCircle size={24} style={{ color: '#667eea' }} />
                            <div>
                              <strong>{comment.guestName}</strong>
                              {user && comment.userId === user.id && (
                                <Badge bg="primary" className="ms-2 small">Bạn</Badge>
                              )}
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-muted">
                              {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                            {canDeleteComment && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-danger p-0"
                                onClick={() => handleDeleteComment(comment.id, comment.userId)}
                                title="Xóa bình luận"
                              >
                                <Trash size={16} />
                              </Button>
                            )}
                          </div>
                        </div>
                        <Card.Text className="mb-0" style={{ paddingLeft: '32px' }}>
                          {comment.content}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default DiaryDetail;