import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function DiaryCard({ diary, showActions = false, onDelete }) {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">{diary.title}</Card.Title>
          <Badge bg={diary.isPublic ? 'success' : 'secondary'}>
            {diary.isPublic ? '🌐 Public' : '🔒 Private'}
          </Badge>
        </div>
        
        <Card.Text className="text-muted small mb-3">
          {new Date(diary.createdAt).toLocaleDateString('vi-VN')}
        </Card.Text>
        
        <Card.Text style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {diary.content}
        </Card.Text>
      </Card.Body>
      
      <Card.Footer className="bg-white border-top-0">
        <div className="d-flex gap-2">
          <Button 
            as={Link} 
            to={`/diary/${diary.id}`} 
            variant="outline-primary" 
            size="sm"
          >
            Xem chi tiết
          </Button>
          
          {showActions && (
            <>
              <Button 
                as={Link} 
                to={`/diary/edit/${diary.id}`} 
                variant="outline-secondary" 
                size="sm"
              >
                Sửa
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => onDelete(diary.id)}
              >
                Xóa
              </Button>
            </>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}

export default DiaryCard;