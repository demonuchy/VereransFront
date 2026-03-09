import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function NewsCard({
  id,
  date,
  title,
  content,
  image,
  editMode = false,
  onDelete,
  onEdit
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  
  // Форматируем дату
  const formattedDate = date ? new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '';
  
  // Проверяем, есть ли изображение
  const imageSrc = image ? `data:image/jpeg;base64,${image}` : '/placeholder-image.jpg';

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      setIsDeleting(true);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting news:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleCardClick = () => {
    if (!editMode && !isDeleting) {
      navigate(`/news/${id}`);
    }
  };

  return (
    <div 
      className={`news-card-wrapper ${editMode ? 'edit-mode-active' : ''} ${isDeleting ? 'deleting' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editMode && (
        <>
          <button 
            className={`news-card-remove ${isHovered ? 'visible' : ''}`}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Удалить новость"
          >
            {isDeleting ? (
              <span className="remove-spinner"></span>
            ) : (
              <span className="remove-icon">
                <span id="1"></span>
                <span id="2"></span>
              </span>
            )}
          </button>
          
          <button
            className={`news-card-edit ${isHovered ? 'visible' : ''}`}
            onClick={handleEdit}
            title="Редактировать новость"
            disabled={isDeleting}
          > 
            <span className="edit-icon">✎</span>
          </button>
        </>
      )}
      
      <div 
        className={`news-card ${editMode ? 'edit-mode' : ''}`}
        onClick={handleCardClick}
        style={{ cursor: editMode ? 'default' : 'pointer' }}
      >
        <div className="news-image">
          <img 
            src={imageSrc} 
            alt="News img"
            onError={(e) => {
              e.target.src = '/news_placeholder.gif';
            }}
          />
          {editMode && <div className="edit-mode-overlay"></div>}
        </div>
        
        <div className="news-content">
          <span className="news-date">{formattedDate}</span>
          <h3 className="news-title">{title}</h3>
          <Link to={`/news/${id}`} className="news-link" onClick={(e) => e.stopPropagation()}>
            Подробнее 
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;