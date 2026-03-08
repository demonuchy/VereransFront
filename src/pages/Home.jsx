// pages/Home.jsx
import { useCallback, useEffect, useState, useRef } from "react";
import NewsCard from "../components/NewsCard";
import NewsModalBuilder from "../components/NewsModalBuilder";
import useApi from "../hooks/useApi";
import { useAuth } from '../hooks/useAuthContext';

function Home() {
    const [news, setNews] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [editingNewsId, setEditingNewsId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createNews, getAllNews, deleteNewsById, updateNewsById } = useApi();
    const [editMode, setEditMode] = useState(false);
    const { user } = useAuth();
    
    const isFirstLoad = useRef(true);

    const fetchNews = useCallback(async () => {
        try {
            const response = await getAllNews();
            setNews(response.data.news);
        } catch (err) {
            console.error('Error fetching news:', err);
            setNews([]);
        } 
    }, [getAllNews]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                await fetchNews(true);
            }
        };
        
        loadInitialData();
        console.log(user)
    }, [fetchNews, user]);

    const doubleClickHandler = useCallback((e) => {
        if (e.target.closest('button')) return;
        setEditMode(!editMode);
    }, [editMode]);

    const handleSaveNews = useCallback(async (newsData) => {
        try {
            setIsSubmitting(true);
            
            if (newsData.mode === 'edit') {
                // Преобразуем существующие изображения из base64 в File объекты
                const existingFiles = await Promise.all(
                    (newsData.existingImages || []).map(async (img, index) => {
                        // Если есть base64, конвертируем в File
                        if (img.base64) {
                            const base64Data = img.base64;
                            const byteCharacters = atob(base64Data);
                            const byteNumbers = new Array(byteCharacters.length);
                            
                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: 'image/jpeg' });
                            
                            return new File(
                                [blob], 
                                img.filename || `existing-image-${index}.jpg`, 
                                { type: 'image/jpeg' }
                            );
                        }
                        
                        // Если есть url, загружаем и конвертируем
                        if (img.url) {
                            const response = await fetch(img.url);
                            const blob = await response.blob();
                            return new File(
                                [blob], 
                                img.filename || `existing-image-${index}.jpg`, 
                                { type: blob.type }
                            );
                        }
                        
                        return null;
                    })
                );
    
                // Фильтруем null значения и объединяем с новыми изображениями
                const allImageFiles = [
                    ...existingFiles.filter(f => f !== null),
                    ...(newsData.newImages || [])
                ];
    
                console.log('Sending all images as files:', allImageFiles);
    
                await updateNewsById(
                    newsData.id,
                    newsData.title,
                    newsData.content,
                    allImageFiles, // Теперь все элементы - File объекты
                    localStorage.getItem('accessToken')
                );
                
                console.log('News updated successfully');
            } else {
                // Режим создания
                await createNews(
                    newsData.title,
                    newsData.content,
                    newsData.images || [],
                    localStorage.getItem('accessToken')
                );
                console.log('News created successfully');
            }
            
            await fetchNews(false);
            setIsModalOpen(false);
            setEditingNewsId(null);
            setModalMode('create');
        } catch (error) {
            console.error('Error saving news:', error);
            alert('Произошла ошибка при сохранении новости');
        } finally {
            setIsSubmitting(false);
        }
    }, [createNews, updateNewsById, fetchNews]);

    const handleDeleteNews = useCallback(async (newsId) => {
        try {
            await deleteNewsById(newsId, localStorage.getItem('accessToken'));
            setNews(prevNews => prevNews.filter(item => item.id !== newsId));
        } catch (error) {
            console.error('Error deleting news:', error);
            await fetchNews(false);
            throw error;
        }
    }, [deleteNewsById, fetchNews]);

    const handleEditNews = useCallback((newsId) => {
        setEditingNewsId(newsId);
        setModalMode('edit');
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingNewsId(null);
        setModalMode('create');
    }, []);

    const handleOpenCreateModal = useCallback(() => {
        setModalMode('create');
        setEditingNewsId(null);
        setIsModalOpen(true);
    }, []);

    if (news?.length === 0) {
        return (
            <div className="home-page">
                <section className="home-hero">
                    <div className="home-hero-overlay"></div>
                    <div className="container">
                        <div className="home-hero-content">
                            <h1 className="home-hero-title">Добро пожаловать!</h1>
                            <p className="home-hero-subtitle">
                                Будьте в курсе последних событий и новостей сообщества ветеранов
                            </p>
                        </div>
                    </div>
                </section>

                <section className="home-empty-section">
                    <div className="container">
                        <div className="empty-state-card">
                            <div className="empty-state-icon-wrapper">
                                <div className="empty-state-icon">📰</div>
                                <div className="empty-state-icon-glow"></div>
                            </div>
                            <h2 className="empty-state-title">Новостей пока нет</h2>
                            <p className="empty-state-message">
                                Будьте первым, кто поделится важной новостью с сообществом!
                            </p>
                            {(user?.role === "admin" || user?.role === "root") && (
                                <button 
                                    className="empty-state-create-button"
                                    onClick={handleOpenCreateModal}
                                >
                                    <span className="empty-state-button-icon">+</span>
                                    Создать первую новость
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <NewsModalBuilder
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveNews}
                    mode={modalMode}
                    newsId={editingNewsId}
                    isSubmitting={isSubmitting}
                />
            </div>
        );
    }

    return (
        <div className="home-page">
            <section className="home-hero">
                <div className="home-hero-overlay"></div>
                <div className="container">
                    <div className="home-hero-content">
                        <h1 className="home-hero-title">Новости сообщества</h1>
                        <p className="home-hero-subtitle">
                            Актуальные события и важные объявления для ветеранов
                        </p>
                        {((user?.role === "admin" || user?.role === "root") && editMode) && (
                            <button 
                                className="home-hero-create-button"
                                onClick={handleOpenCreateModal}
                            >
                                <span className="home-hero-button-icon">+</span>
                                Создать новость
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="home-news-section" onDoubleClick={doubleClickHandler}>
                <div className="container-news">
                    {editMode && (user?.role === "admin" || user?.role === "root") && (
                        <div className="edit-mode-banner">
                            <span className="edit-mode-icon">✎</span>
                            <span className="edit-mode-text">Режим редактирования активен</span>
                            <span className="edit-mode-hint">Дважды кликните для выхода</span>
                        </div>
                    )}

                    <div className={`news-grid ${editMode ? 'edit-mode' : ''}`}>
                        {news?.map((item) => (
                            <div key={item.id} className="news-grid-item">
                                <NewsCard
                                    id={item.id}
                                    title={item.title}
                                    date={item.created_at}
                                    image={item.images?.[0]?.base64 || null}
                                    editMode={editMode && (user?.role === "admin" || user?.role === "root")}
                                    onDelete={handleDeleteNews}
                                    onEdit={handleEditNews}
                                />
                            </div>
                        ))}  
                        
                        {((user?.role === "admin" || user?.role === "root") && editMode) && (
                            <div className="news-grid-item create-card">
                                <button 
                                    className="create-news-card"
                                    onClick={handleOpenCreateModal}
                                >
                                    <div className="create-news-icon">+</div>
                                    <span className="create-news-text">Создать новость</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <NewsModalBuilder
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveNews}
                mode={modalMode}
                newsId={editingNewsId}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}

export default Home;