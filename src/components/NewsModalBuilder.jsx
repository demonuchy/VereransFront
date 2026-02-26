import { useState, useRef } from "react";

function NewsModalBuilder({ isOpen, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim() && content.trim()) {
            onSave({
                title,
                content,
                images: images.map(img => img.file)
            });
            // Сброс формы
            setTitle("");
            setContent("");
            setImages([]);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Создать новость</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="title">Заголовок новости</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введите заголовок"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Текст новости</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Введите текст новости"
                            rows="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Изображения</label>
                        <div 
                            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
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

                        {images.length > 0 && (
                            <div className="image-preview-container">
                                {images.map((image) => (
                                    <div key={image.id} className="image-preview">
                                        <img src={image.preview} alt="Preview" />
                                        <button 
                                            type="button"
                                            className="remove-image"
                                            onClick={() => removeImage(image.id)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="submit" className="save-button">
                            Опубликовать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewsModalBuilder;