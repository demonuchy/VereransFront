import { Link } from "react-router-dom";
import { useState } from "react";

function NewsCard({
  id,
  date,
  title, 
  image,
  editMode = false,
  onDelete // Добавим проп для обработки удаления
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  return (
    <div 
      className={`news-card-wrapper ${editMode ? 'edit-mode-active' : ''} ${isDeleting ? 'deleting' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editMode && (
        <button 
          className={`news-card-remove ${isHovered ? 'visible' : ''} ${isDeleting ? 'deleting' : ''}`}
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
      )}
      
      <div className={`news-card ${editMode ? 'edit-mode' : ''}`}>
        <div className="news-image">
          <img 
            src={imageSrc} 
            alt={title || "News image"}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          {editMode && <div className="edit-mode-overlay"></div>}
        </div>
        
        <div className="news-content">
          <span className="news-date">{formattedDate}</span>
          <h3 className="news-title">{title}</h3>
          <Link to={`/news/${id}`} className="news-link">
            Подробнее 
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;