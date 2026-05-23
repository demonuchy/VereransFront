// src/components/Comment.jsx
import React from 'react';
import { useState, useCallback, useMemo } from "react";

import { useAuth } from '../hooks/useAuthContext';


const Comment = ({ comment, formatRelativeTime, id, onDelete }) => {
  const { user } = useAuth()
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  console.log("Commentid : ", id)
  const handleDelete = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) return;
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error('Error deleting news:', error);
      setIsDeleting(false);
    }
  }, [id, onDelete]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const removeButtonClassName = useMemo(() => {
    return `news-card-remove ${isHovered ? 'visible' : ''}`;
  }, [isHovered]);

  return (
    <div 
      className="comments-modal-item" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      
      {(user?.role === "admin" || user?.role === "root") &&  <button 
            className={removeButtonClassName}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Удалить новость"
            aria-label="Удалить новость"
          >
            {isDeleting ? (
              <span className="remove-spinner" aria-hidden="true" />
            ) : (
              <span className="remove-icon" aria-hidden="true">
                <img src="bin.png" alt="" />
              </span>
            )}
      </button>}
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