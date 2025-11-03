import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, InputGroup, Image, Modal, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, HeartFill, ChatDots, Send, PersonCircle, Globe, Lock } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';
import { toast } from 'react-toastify';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [diaries, setDiaries] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [likedDiaries, setLikedDiaries] = useState(new Set());
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetchDiaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

const fetchDiaries = async () => {
  try {
    // Get all diaries - SẮP XẾP THEO createdAt GIẢM DẦN
    const response = await api.api.get('/diaries?_sort=createdAt&_order=desc');
    let allDiaries = response.data;
    
    // Filter: 
    // - Show all PUBLIC diaries
    // - Show PRIVATE diaries only if user is logged in AND is the owner
    const filteredDiaries = allDiaries.filter(diary => {
      if (diary.isPublic) {
        return true; // Show all public
      }
      // Show private only if user owns it
      return user && diary.userId === user.id;
    });
    
        filteredDiaries.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    
    setDiaries(filteredDiaries);
    
    // Fetch users
    const uniqueUserIds = [...new Set(filteredDiaries.map(d => d.userId))];
    const userPromises = uniqueUserIds.map(userId => 
      api.getUserById(userId)
    );
    const userResponses = await Promise.all(userPromises);
    
    const usersMap = {};
    userResponses.forEach(res => {
      usersMap[res.data.id] = res.data;
    });
    
    setUsers(usersMap);
    
    // Fetch comments for public diaries
    const commentsMap = {};
    for (const diary of filteredDiaries) {
      if (diary.isPublic) {
        const commentsRes = await api.getComments(diary.id);
        commentsMap[diary.id] = commentsRes.data;
      }
    }
    setComments(commentsMap);
    
  } catch (err) {
    toast.error('Không thể tải nhật ký!');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleLike = async (diaryId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const isLiked = likedDiaries.has(diaryId);
    
    try {
      if (isLiked) {
        await api.unlikeDiary(diaryId);
        setLikedDiaries(prev => {
          const newSet = new Set(prev);
          newSet.delete(diaryId);
          return newSet;
        });
      } else {
        await api.likeDiary(diaryId);
        setLikedDiaries(prev => new Set(prev).add(diaryId));
      }
      
      setDiaries(diaries.map(d => 
        d.id === diaryId 
          ? { ...d, likes: (d.likes || 0) + (isLiked ? -1 : 1) }
          : d
      ));
    } catch (err) {
      toast.error('Không thể like!');
      console.error(err);
    }
  };

  const handleCommentClick = (diary) => {
    if (!diary.isPublic) {
      toast.info('Không thể bình luận trên bài viết riêng tư!');
      return;
    }
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    toggleComments(diary.id);
  };

  const handleComment = async (diaryId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const content = commentInputs[diaryId];
    if (!content || !content.trim()) return;

    try {
      const commentData = {
        diaryId,
        userId: user.id,
        guestName: user.username,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      
      const response = await api.addComment(commentData);
      
      setComments({
        ...comments,
        [diaryId]: [response.data, ...(comments[diaryId] || [])]
      });
      
      setCommentInputs({ ...commentInputs, [diaryId]: '' });
      toast.success('Đã thêm bình luận!');
    } catch (err) {
      toast.error('Không thể thêm bình luận!');
      console.error(err);
    }
  };

  const toggleComments = (diaryId) => {
    setShowComments({
      ...showComments,
      [diaryId]: !showComments[diaryId]
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-white" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container style={{ maxWidth: '650px' }} className="py-4">
        {/* Hero Section - Only for guests */}
        {!user && (
          <Card className="glass-card border-0 text-center mb-4 fade-in">
            <Card.Body className="p-4">
              <h3 className="mb-3">👋 Chào mừng đến với Nhật Ký Cá Nhân!</h3>
              <p className="text-muted mb-4">
                Ghi lại khoảnh khắc của bạn, chia sẻ câu chuyện với mọi người
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Button 
                  as={Link} 
                  to="/register" 
                  className="btn-gradient-primary"
                >
                  <PersonCircle size={18} className="me-2" />
                  Đăng ký ngay
                </Button>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary"
                >
                  Đăng nhập
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Feed Title */}
        <div className="mb-4 text-center">
          <h2 className="text-white mb-2">
            {user ? `👋 Xin chào, ${user.username}!` : '🌐 Nhật Ký Công Khai'}
          </h2>
          <p className="text-white-50">
            {user 
              ? 'Hôm nay bạn muốn viết gì?' 
              : 'Đăng nhập để like, bình luận và viết nhật ký'}
          </p>
        </div>

        {/* Diaries Feed */}
        {diaries.length === 0 ? (
          <Card className="glass-card text-center p-5">
            <Card.Body>
              <h4>Chưa có nhật ký nào</h4>
              <p className="text-muted">
                {user ? 'Hãy viết nhật ký đầu tiên của bạn!' : 'Hãy quay lại sau nhé!'}
              </p>
              {user && (
                <Button as={Link} to="/diary/new" className="btn-gradient-primary mt-2">
                  Viết ngay
                </Button>
              )}
            </Card.Body>
          </Card>
        ) : (
          <div className="d-flex flex-column gap-3">
            {diaries.map(diary => {
              const author = users[diary.userId] || {};
              const isLiked = likedDiaries.has(diary.id);
              const diaryComments = comments[diary.id] || [];
              const showCommentsSection = showComments[diary.id];
              const isOwner = user && user.id === diary.userId;
              
              return (
                <Card key={diary.id} className="glass-card border-0 hover-lift fade-in">
                  <Card.Body className="p-4">
                    {/* Header */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <Image 
                          src={author.avatar || `https://ui-avatars.com/api/?name=${author.username}&background=667eea&color=fff`}
                          roundedCircle 
                          width={45} 
                          height={45}
                          className="me-3"
                        />
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong>{author.username || 'User'}</strong>
                            {isOwner && <Badge bg="primary" className="small">Bạn</Badge>}
                          </div>
                          <div className="text-muted small">
                            {new Date(diary.createdAt).toLocaleDateString('vi-VN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Privacy Badge */}
                      <Badge 
                        bg={diary.isPublic ? 'success' : 'secondary'}
                        className="d-flex align-items-center gap-1"
                        style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                      >
                        {diary.isPublic ? (
                          <>
                            <Globe size={14} />
                            Công khai
                          </>
                        ) : (
                          <>
                            <Lock size={14} />
                            Riêng tư
                          </>
                        )}
                      </Badge>
                    </div>

                    {/* Content */}
                    <h5 className="mb-2">{diary.title}</h5>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{diary.content}</p>

                    {/* Actions - Only for public diaries */}
                    {diary.isPublic ? (
                      <>
                        <div className="d-flex align-items-center gap-4 mt-3 pt-3 border-top">
                          <Button 
                            variant="link" 
                            className="text-decoration-none p-0 d-flex align-items-center gap-2"
                            onClick={() => handleLike(diary.id)}
                          >
                            {isLiked ? (
                              <HeartFill size={22} style={{ color: '#e74c3c' }} />
                            ) : (
                              <Heart size={22} style={{ color: '#666' }} />
                            )}
                            <span style={{ color: isLiked ? '#e74c3c' : '#666' }}>
                              {diary.likes || 0}
                            </span>
                          </Button>

                          <Button 
                            variant="link" 
                            className="text-decoration-none text-muted p-0 d-flex align-items-center gap-2"
                            onClick={() => handleCommentClick(diary)}
                          >
                            <ChatDots size={22} />
                            <span>{diaryComments.length}</span>
                          </Button>

                          <Button 
                            as={Link}
                            to={`/diary/${diary.id}`}
                            variant="link" 
                            className="text-decoration-none text-muted p-0 ms-auto"
                          >
                            Xem chi tiết →
                          </Button>
                        </div>

                        {/* Comments Section */}
                        {showCommentsSection && user && (
                          <div className="mt-3 pt-3 border-top">
                            {/* Comment Input */}
                            <InputGroup className="mb-3">
                              <Form.Control
                                placeholder="Viết bình luận..."
                                value={commentInputs[diary.id] || ''}
                                onChange={(e) => setCommentInputs({
                                  ...commentInputs,
                                  [diary.id]: e.target.value
                                })}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleComment(diary.id);
                                  }
                                }}
                              />
                              <Button 
                                variant="outline-primary"
                                onClick={() => handleComment(diary.id)}
                              >
                                <Send size={16} />
                              </Button>
                            </InputGroup>

                            {/* Comments List */}
                            {diaryComments.map(comment => (
                              <div key={comment.id} className="mb-2 p-2 rounded" style={{ background: '#f8f9fa' }}>
                                <div className="d-flex justify-content-between">
                                  <strong className="small">{comment.guestName}</strong>
                                  <small className="text-muted">
                                    {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </small>
                                </div>
                                <p className="mb-0 small">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      // Private post - only show view detail for owner
                      <div className="mt-3 pt-3 border-top">
                        <Button 
                          as={Link}
                          to={`/diary/${diary.id}`}
                          variant="outline-primary"
                          size="sm"
                        >
                          Xem chi tiết →
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      {/* Login Required Modal */}
      <Modal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Yêu cầu đăng nhập</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <PersonCircle size={60} style={{ color: '#667eea' }} className="mb-3" />
          <h5 className="mb-3">Bạn cần đăng nhập để thực hiện hành động này</h5>
          <p className="text-muted mb-4">
            Đăng nhập để like, bình luận và tạo nhật ký của riêng bạn!
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button 
              className="btn-gradient-primary"
              onClick={() => {
                setShowLoginModal(false);
                navigate('/login');
              }}
            >
              Đăng nhập
            </Button>
            <Button 
              variant="outline-primary"
              onClick={() => {
                setShowLoginModal(false);
                navigate('/register');
              }}
            >
              Đăng ký
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Home;