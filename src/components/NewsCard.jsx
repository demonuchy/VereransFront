import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useCallback, memo } from "react";

const NewsCard = memo(({
  id,
  date,
  title,
  image,
  editMode = false,
  onDelete,
  onEdit
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  // Оптимизированное форматирование даты
  const formattedDate = useMemo(() => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    // Проверка на валидность даты
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [date]);
  
  // Оптимизированный путь к изображению с кэшированием
  const imageSrc = useMemo(() => {
    if (imageError) return '/news_placeholder.gif';
    if (image && image.startsWith('http')) return image;
    return image || '/placeholder-image.jpg';
  }, [image, imageError]);
  
  // Мемоизированные обработчики
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  
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
  
  const handleEdit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(id);
  }, [id, onEdit]);
  
  const handleCardClick = useCallback(() => {
    if (!editMode && !isDeleting) {
      navigate(`/news/${id}`);
    }
  }, [editMode, isDeleting, id, navigate]);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  // Предотвращаем лишние ререндеры через useMemo для классов
  const wrapperClassName = useMemo(() => {
    return `news-card-wrapper ${editMode ? 'edit-mode-active' : ''} ${isDeleting ? 'deleting' : ''}`;
  }, [editMode, isDeleting]);
  
  const cardClassName = useMemo(() => {
    return `news-card ${editMode ? 'edit-mode' : ''}`;
  }, [editMode]);
  
  const removeButtonClassName = useMemo(() => {
    return `news-card-remove ${isHovered ? 'visible' : ''}`;
  }, [isHovered]);
  
  const editButtonClassName = useMemo(() => {
    return `news-card-edit ${isHovered ? 'visible' : ''}`;
  }, [isHovered]);
  
  // Ленивая загрузка изображения с предпросмотром
  const imageElement = useMemo(() => (
    <img 
      src={imageSrc}
      alt={title || 'News image'}
      loading="lazy"
      decoding="async"
      onError={handleImageError}
      style={{ 
        transition: 'transform 0.5s ease',
        willChange: 'transform'
      }}
    />
  ), [imageSrc, title, handleImageError]);
  
  return (
    <div 
      className={wrapperClassName}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'none' }}
    >
      {editMode && (
        <>
          <button 
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
          </button>
          
          <button
            className={editButtonClassName}
            onClick={handleEdit}
            title="Редактировать новость"
            disabled={isDeleting}
            aria-label="Редактировать новость"
          > 
            <span className="edit-icon" aria-hidden="true">✎</span>
          </button>
        </>
      )}
      
      <div 
        className={cardClassName}
        onClick={handleCardClick}
        style={{ cursor: editMode ? 'default' : 'pointer' }}
        role={editMode ? 'article' : 'button'}
        tabIndex={editMode ? undefined : 0}
        onKeyPress={editMode ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCardClick();
          }
        }}
      >
        <div className="news-image">
          {imageElement}
          {editMode && <div className="edit-mode-overlay" aria-hidden="true" />}
        </div>
        
        <div className="news-content">
          <time className="news-date" dateTime={date}>
            {formattedDate}
          </time>
          <h3 className="news-title">{title}</h3>
          <Link 
            to={`/news/${id}`} 
            className="news-link" 
            onClick={(e) => e.stopPropagation()}
            aria-label={`Читать подробнее о ${title}`}
          >
            Подробнее 
          </Link>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для предотвращения лишних ререндеров
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.date === nextProps.date &&
    prevProps.image === nextProps.image &&
    prevProps.editMode === nextProps.editMode &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onEdit === nextProps.onEdit
  );
});

// Добавляем display name для отладки
NewsCard.displayName = 'NewsCard';

export default NewsCard;