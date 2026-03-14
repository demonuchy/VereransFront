// src/components/CommentsModal.jsx
import React, { useState } from 'react';
import Comment from './Comment';

const CommentsModal = ({ 
  isOpen, 
  onClose, 
  comments, 
  onSubmitComment,
  isSubmitting 
}) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const success = await onSubmitComment(commentText);
    console.log("я вернул:", success)
    if (success) {
        console.log("Я пытаюсть очистить поле со всех сил ....")
      setCommentText(''); // Очищаем поле только после успешной отправки
    }
    console.log("мне пох")
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'только что';
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'минуту' : minutes < 5 ? 'минуты' : 'минут'} назад`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`;
      }
      
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={e => e.stopPropagation()}>
        <div className="comments-modal-header">
          <h3 className="comments-modal-title">Комментарии ({comments.length})</h3>
          <button className="comments-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="comments-modal-content">
          {/* Форма добавления комментария */}
          <div className="comments-modal-form">
            <form onSubmit={handleSubmit}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Напишите комментарий..."
                className="comments-modal-textarea"
                rows="2"
                maxLength="1000"
                required
              />
              <div className="comments-modal-form-footer">
                <span className="comments-modal-char-count">
                  {commentText.length}/1000
                </span>
                <button 
                  type="submit" 
                  className="comments-modal-submit"
                  disabled={isSubmitting || !commentText.trim()}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </form>
          </div>

          {/* Список комментариев */}
          <div className="comments-modal-list">
            {comments.length === 0 ? (
              <div className="comments-modal-empty">
                <p>Пока нет комментариев</p>
                <span>Будьте первым, кто оставит комментарий!</span>
              </div>
            ) : (
              comments.map((comment, index) => (
                <Comment 
                  key={comment.id || index} 
                  comment={comment} 
                  formatRelativeTime={formatRelativeTime}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;