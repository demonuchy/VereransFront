import { useState, useRef, useEffect } from "react";
import useApi from "../hooks/useApi";

function NewsModalBuilder({ 
  isOpen, 
  onClose, 
  onSave,
  mode = 'create',
  newsId = null,
  isSubmitting = false 
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const { getNewsById } = useApi();

  // Загружаем данные новости при открытии модалки в режиме редактирования
  useEffect(() => {
    const loadNewsData = async () => {
      if (mode === 'edit' && newsId && isOpen) {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await getNewsById(newsId);
          const newsData = response.data.news;
          
          setTitle(newsData.title || "");
          setContent(newsData.body || "");
          
          // Загружаем существующие изображения
          if (newsData.images && newsData.images.length > 0) {
            setExistingImages(newsData.images);
          }
        } catch (err) {
          console.error('Error loading news data:', err);
          setError('Не удалось загрузить данные новости');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadNewsData();
  }, [mode, newsId, isOpen, getNewsById]);

  // Сбрасываем форму при закрытии
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle("");
        setContent("");
        setImages([]);
        setExistingImages([]);
        setDragActive(false);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file: file,
          preview: e.target.result,
          id: Date.now() + Math.random()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Подготавливаем данные для сохранения
    const newsData = {
      title: title.trim(),
      content: content.trim(),
      newImages: images.map(img => img.file),
      existingImages: existingImages,
      mode,
      ...(mode === 'edit' && newsId && { id: newsId })
    };
    console.log("News data : ", newsData)
    onSave(newsData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mode === 'edit' 
              ? isLoading 
                ? 'Загрузка данных...' 
                : 'Редактировать новость'
              : 'Создать новость'
            }
          </h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={isSubmitting || isLoading}
          >
            &times;
          </button>
        </div>
        
        {isLoading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="modal-error">
            <p className="error-message">{error}</p>
            <button 
              className="modal-retry-button"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="title">
                Заголовок новости <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите заголовок"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Текст новости <span className="required">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Введите текст новости"
                rows="8"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label>Изображения</label>
              
              {/* Существующие изображения (только для режима редактирования) */}
              {existingImages.length > 0 && (
                <div className="existing-images-section">
                  <p className="section-label">Текущие изображения:</p>
                  <div className="image-preview-container">
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="image-preview existing">
                        <img 
                          src={typeof img === 'string' 
                            ? img 
                            : img.base64 
                              ? `data:image/jpeg;base64,${img.base64}`
                              : img.url || '/placeholder-image.jpg'
                          } 
                          alt={`Existing ${index + 1}`}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <button 
                          type="button"
                          className="remove-image"
                          onClick={() => removeExistingImage(index)}
                          disabled={isSubmitting}
                          title="Удалить изображение"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Зона загрузки новых изображений */}
              <div 
                className={`drop-zone ${dragActive ? 'drag-active' : ''} ${isSubmitting ? 'disabled' : ''}`}
                onDragEnter={!isSubmitting ? handleDrag : null}
                onDragLeave={!isSubmitting ? handleDrag : null}
                onDragOver={!isSubmitting ? handleDrag : null}
                onDrop={!isSubmitting ? handleDrop : null}
                onClick={() => !isSubmitting && fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={isSubmitting}
                />
                <div className="drop-zone-content">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>Перетащите изображения сюда или кликните для выбора</p>
                  <span className="hint">Поддерживаются JPG, PNG, GIF</span>
                </div>
              </div>

              {/* Новые загруженные изображения */}
              {images.length > 0 && (
                <div className="new-images-section">
                  <p className="section-label">Новые изображения:</p>
                  <div className="image-preview-container">
                    {images.map((image) => (
                      <div key={image.id} className="image-preview new">
                        <img src={image.preview} alt="Preview" />
                        <button 
                          type="button"
                          className="remove-image"
                          onClick={() => removeImage(image.id)}
                          disabled={isSubmitting}
                          title="Удалить изображение"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="hint">* Максимальный размер файла: 5MB</span>
            </div>

            <div className="modal-footer">
              <button 
                type="submit" 
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="button-loader">Сохранение...</span>
                ) : (
                  mode === 'edit' ? 'Сохранить изменения' : 'Опубликовать'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default NewsModalBuilder;