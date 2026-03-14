import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import useApi from '../hooks/useApi';
import LoadScreen from '../components/LoadScreen';
import CommentsModal from '../components/CommentsModal';

function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const { getNewsById, likeNews, leaveComment } = useApi();
  
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
        console.log("Like news");
        const response = await likeNews(id)
        console.log("Like response", response)
        if (response){
          setIsLiked(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error liking news:", error);
    }
  };

  const handleCommentSubmit = useCallback(async (commentText) => {
    if (!commentText.trim()) return false;
    
    setIsSubmittingComment(true);
    try {
      const response = await leaveComment(id, commentText);
      const newComment = {
          id: Date.now(),
          body: commentText,
          user: 'Пользователь',
          created_at: new Date().toISOString(),
          ...response?.data
        };
      setComments(prev => [newComment, ...prev]);
      return true; // Возвращаем true при успехе
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    } finally {
      setIsSubmittingComment(false);
    }
  }, [id, leaveComment]);

  const openCommentsModal = () => {
    setIsCommentsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

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
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={closeCommentsModal}
        comments={comments}
        onSubmitComment={handleCommentSubmit}
        isSubmitting={isSubmittingComment}
      />
      
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