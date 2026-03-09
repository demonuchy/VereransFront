import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import LoadScreen from '../components/LoadScreen';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const { getNewsById, likeNews, addComment, getComments } = useApi();
  
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        const response = await getNewsById(id);
        console.log("API Response:", response);
        
        if (response?.data?.news) {
          setNews(response.data.news);
          setLikesCount(response.data.news.like || 0);
          setViewsCount(response.data.news.views || 0);
          setComments(response.data.news.comments || []);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchNewsData();
    }
  }, [id, getNewsById]);

  // Загрузка комментариев при открытии модального окна
  const loadComments = async () => {
    try {
      const response = await getComments(id);
      if (response?.data?.comments) {
        setComments(response.data.comments);
      } else if (Array.isArray(response)) {
        setComments(response);
      } else if (response?.comments) {
        setComments(response.comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleNextImage = () => {
    if (!news?.images || news.images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === news.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    if (!news?.images || news.images.length <= 1) return;
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? news.images.length - 1 : prevIndex - 1
    );
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleLike = async () => {
    try {
      if (!isLiked) {
        const response = await likeNews(id);
        if (response?.success) {
          setLikesCount(prev => prev + 1);
          setIsLiked(true);
        }
      }
    } catch (error) {
      console.error("Error liking news:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const response = await addComment(id, { text: commentText });
      if (response?.success) {
        // Добавляем новый комментарий в список
        const newComment = {
          id: Date.now(),
          text: commentText,
          user: 'Пользователь',
          created_at: new Date().toISOString(),
          ...response?.data
        };
        
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openCommentsModal = () => {
    setIsCommentsModalOpen(true);
    loadComments(); // Обновляем комментарии при открытии
    // Блокируем прокрутку основного контента
    document.body.style.overflow = 'hidden';
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    // Возвращаем прокрутку
    document.body.style.overflow = 'unset';
  };

  // Функция для безопасного форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };

  // Форматирование даты для комментариев (относительное время)
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

  // Функция для безопасного получения текста
  const getContent = () => {
    return news?.body || news?.content || '';
  };

  // Функция для безопасного получения изображений
  const getImages = () => {
    if (!news?.images || !Array.isArray(news.images)) return [];
    
    return news.images.map(img => {
      if (typeof img === 'string') return img;
      if (img?.base64) return `data:image/jpeg;base64,${img.base64}`;
      if (img?.url) return img.url;
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return <LoadScreen />;
  }

  if (!news) {
    return (
      <div className="news-detail-page">
        <div className="news-detail-error">
          <div className="news-error-content">
            <h1 className="news-error-title">Новость не найдена</h1>
            <p className="news-error-text">Новость с ID #{id} не существует или была удалена.</p>
            <button onClick={handleBack} className="news-back-button">
              Вернуться к списку новостей
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = getContent();
  const images = getImages();
  const formattedDate = formatDate(news.created_at || news.date);

  return (
    <div className="news-detail-page">
      <div className="news-detail-container">
        {/* Кнопка назад сверху */}
        <div className="news-top-bar">
          <button onClick={handleBack} className="news-back-top-button">
            ← Назад к новостям
          </button>
        </div>

        {/* Контент новости */}
        <article className="news-content-section">
          <div className="news-content-header">
            <h1 className="news-content-title">{news.title || 'Без названия'}</h1>
            <div className="news-meta-top">
              {formattedDate && (
                <span className="news-meta-date-top">{formattedDate}</span>
              )}
            </div>
          </div>
          
          <div className="news-content-body">
            {content.split('\n').map((paragraph, index) => {
              if (!paragraph.trim()) {
                return <br key={index} className="news-content-break" />;
              }
              
              if (paragraph.trim().startsWith('•')) {
                return (
                  <div key={index} className="news-list-item">
                    <span className="news-list-bullet">•</span>
                    <span className="news-list-text">{paragraph.trim().substring(2)}</span>
                  </div>
                );
              }
              
              return (
                <p key={index} className="news-content-paragraph">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </article>

        {/* Блок с изображениями под новостью */}
        {images.length > 0 && (
          <div className="news-images-section-bottom">
            <div className="news-images-header-bottom">
              <h3 className="news-images-title-bottom">Фотографии с мероприятия</h3>
            </div>
            
            <div className="news-images-slider-bottom">
              <div className="news-slider-wrapper-bottom">
                <img 
                  src={images[currentImageIndex]} 
                  alt={news.title || 'News image'} 
                  className="news-main-image-bottom"
                  onError={(e) => {
                    console.log("Ошибка отображения изображения");
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%23f0f0f0"/><text x="400" y="200" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle">Изображение недоступно</text></svg>';
                  }}
                />
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={handlePrevImage}
                      className="news-slider-button-bottom news-slider-prev-bottom"
                      aria-label="Предыдущее изображение"
                    >
                      ←
                    </button>
                    <button 
                      onClick={handleNextImage}
                      className="news-slider-button-bottom news-slider-next-bottom"
                      aria-label="Следующее изображение"
                    >
                      →
                    </button>
                    
                    <div className="news-slider-counter-bottom">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Галерея миниатюр под основным изображением */}
            {images.length > 1 && (
              <div className="news-gallery-mini">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`news-gallery-mini-thumb ${
                      index === currentImageIndex ? 'news-mini-thumb-active' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <div className="news-mini-thumb-number">{index + 1}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Блок взаимодействия (лайки, просмотры, комментарии) */}
        <div className="news-interaction-section">
          <div className="news-stats-bar">
            <div className="news-stats-left">
              <button 
                className={`news-like-button ${isLiked ? 'news-liked' : ''}`}
                onClick={handleLike}
                disabled={isLiked}
              >
                <span className="news-like-icon">❤️</span>
                <span className="news-like-count">{likesCount}</span>
              </button>
              
              <div className="news-views">
                <span className="news-views-icon">👁️</span>
                <span className="news-views-count">{viewsCount}</span>
              </div>
              
              <button 
                className="news-comments-button"
                onClick={openCommentsModal}
              >
                <span className="news-comments-icon">💬</span>
                <span className="news-comments-count-number">{comments.length}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Модальное окно комментариев */}
      {isCommentsModalOpen && (
        <div className="comments-modal-overlay" onClick={closeCommentsModal}>
          <div className="comments-modal" onClick={e => e.stopPropagation()}>
            <div className="comments-modal-header">
              <h3 className="comments-modal-title">Комментарии ({comments.length})</h3>
              <button className="comments-modal-close" onClick={closeCommentsModal}>×</button>
            </div>
            
            <div className="comments-modal-content">
              {/* Форма добавления комментария */}
              <div className="comments-modal-form">
                <form onSubmit={handleCommentSubmit}>
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
                      disabled={isSubmittingComment || !commentText.trim()}
                    >
                      {isSubmittingComment ? 'Отправка...' : 'Отправить'}
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
                    <div key={comment.id || index} className="comments-modal-item">
                      <div className="comments-modal-item-header">
                        <span className="comments-modal-item-author">
                          {comment.user || comment.user_name || 'Пользователь'}
                        </span>
                        <span className="comments-modal-item-date">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <div className="comments-modal-item-body">
                        {comment.text || comment.content || ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button 
        className='back-news-list-btn'
        onClick={handleBack}
      >
        Вернуться к списку новостей
      </button>
    </div>
  );
}

export default NewsDetail;