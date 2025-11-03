import React from 'react';
import { Card } from 'react-bootstrap';

function CommentList({ comments }) {
  if (comments.length === 0) {
    return <p className="text-muted text-center">Chưa có bình luận nào</p>;
  }

  return (
    <div>
      {comments.map(comment => (
        <Card key={comment.id} className="mb-3" bg="light">
          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <strong>{comment.guestName}</strong>
              <small className="text-muted">
                {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
            <Card.Text>{comment.content}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default CommentList;