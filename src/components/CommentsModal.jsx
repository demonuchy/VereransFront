// src/components/CommentsModal.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Comment from './Comment';
import useApi from '../hooks/useApi';

const CommentsModal = ({ 
  isOpen, 
  onClose, 
  comments,
  setComments,
  onSubmitComment,
  isSubmitting,
  newsId,
}) => {
  const { deleteComment } = useApi();
  const [commentText, setCommentText] = useState('');  // переименовал, чтобы не конфликтовать с пропсом comments

  // Обновляем локальные комментарии при изменении пропса
  useEffect(() => {
    if (comments && Array.isArray(comments)) {
      setComments(comments);
    }
  }, [comments, setComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const success = await onSubmitComment(commentText);
    if (success) {
      setCommentText(''); // Очищаем поле только после успешной отправки
    }
  };

  const handleDeleteComment = useCallback(async (commentId) => {
    try {
      console.log("Commentid : ", commentId, "News id", newsId)
      await deleteComment(newsId, commentId);
      setComments(prevComments => 
          prevComments.filter(comment => comment.id !== commentId)
        );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, [deleteComment, newsId, setComments]);

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
        const minutesText = getMinutesDeclension(minutes);
        return `${minutes} ${minutesText} назад`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        const hoursText = getHoursDeclension(hours);
        return `${hours} ${hoursText} назад`;
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

  // Функция для склонения минут
  const getMinutesDeclension = (minutes) => {
    if (minutes === 1) return 'минуту';
    if (minutes >= 2 && minutes <= 4) return 'минуты';
    return 'минут';
  };

  // Функция для склонения часов
  const getHoursDeclension = (hours) => {
    if (hours === 1) return 'час';
    if (hours >= 2 && hours <= 4) return 'часа';
    return 'часов';
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
              comments.map((comment) => (
                <Comment 
                  key={comment.id}
                  id={comment.id}
                  newsId={newsId}
                  comment={comment}
                  onDelete={handleDeleteComment}
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