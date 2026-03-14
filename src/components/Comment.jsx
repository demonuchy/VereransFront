// src/components/Comment.jsx
import React from 'react';

const Comment = ({ comment, formatRelativeTime }) => {
  return (
    <div className="comments-modal-item">
      <div className="comments-modal-item-header">
        <span className="comments-modal-item-author">
          {comment.user || comment.user_name || 'Пользователь'}
        </span>
        <span className="comments-modal-item-date">
          {formatRelativeTime(comment.created_at)}
        </span>
      </div>
      <div className="comments-modal-item-body">
        {comment.body || comment.content || ''}
      </div>
    </div>
  );
};

export default Comment;