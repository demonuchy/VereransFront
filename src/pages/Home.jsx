// pages/Home.jsx
import { useCallback, useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import NewsModalBuilder from "../components/NewsModalBuilder";
import LoadScreen from "../components/LoadScreen";
import useApi from "../hooks/useApi";
import { useAuth } from '../hooks/useAuthContext';

function Home() {
    const [news, setNews] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { createNews, getAllNews, deleteNewsById } = useApi();
    const [editMode, setEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { user, loading } = useAuth();
    
    const fetchNews = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllNews();
            setNews(response.data.news);
        } catch (err) {
            console.error('Error fetching news:', err);
            setNews([]);
        } finally {
            setIsLoading(false);
        }
    }, [getAllNews]); 

    useEffect(() => {
        fetchNews();
        setIsLoading(loading);
    }, [fetchNews, loading]);

    const doubleClickHandler = useCallback((e) => {
        if (e.target.closest('button')) return;
        setEditMode(!editMode);
    }, [editMode]);

    const handleSaveNews = useCallback(async (newsData) => {
        try {
            setIsLoading(true);
            await createNews(
                newsData.title, 
                newsData.content, 
                newsData.images, 
                localStorage.getItem('accessToken')
            );
            await fetchNews();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving news:', error);
        } finally {
            setIsLoading(false);
        }
    }, [createNews, fetchNews]);

    const handleDeleteNews = useCallback(async (newsId) => {
        try {
            setIsLoading(true);
            await deleteNewsById(newsId, localStorage.getItem('accessToken'));
            setNews(prevNews => prevNews.filter(item => item.id !== newsId));
        } catch (error) {
            console.error('Error deleting news:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [deleteNewsById]);

    if (isLoading && !news) {
        return <LoadScreen />;
    }

    if (news?.length === 0) {
        return (
            <div className="home-page">
                {/* Герой секция для пустого состояния */}
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
                                    onClick={() => setIsModalOpen(true)}
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
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNews}
                />
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Герой секция */}
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
                                onClick={() => setIsModalOpen(true)}
                            >
                                <span className="home-hero-button-icon">+</span>
                                Создать новость
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Секция с новостями */}
            <section className="home-news-section"  
            onDoubleClick={doubleClickHandler}>
            <div className="container-news">
                {/* Режим редактирования индикатор */}
                {editMode && (user?.role === "admin" || user?.role === "root") && (
                <div className="edit-mode-banner">
                    <span className="edit-mode-icon">✎</span>
                    <span className="edit-mode-text">Режим редактирования активен</span>
                    <span className="edit-mode-hint">Дважды кликните для выхода</span>
                </div>
                )}

                {/* Сетка новостей */}
                <div 
                className={`news-grid ${editMode ? 'edit-mode' : ''}`}
                >
                {news?.map((item, index) => (
                    <div key={item.id} className="news-grid-item">
                    <NewsCard
                        id={item.id}
                        title={item.title}
                        date={item.created_at}
                        image={item.images?.[0]?.base64 || null}
                        editMode={editMode && (user?.role === "admin" || user?.role === "root")}
                        onDelete={handleDeleteNews}
                    />
                    </div>
                ))}  
                
                {/* Кнопка создания новости в режиме редактирования */}
                {((user?.role === "admin" || user?.role === "root") && editMode) && (
                    <div className="news-grid-item create-card">
                    <button 
                        className="create-news-card"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <div className="create-news-icon">+</div>
                        <span className="create-news-text">Создать новость</span>
                    </button>
                    </div>
                )}
                </div>
            </div>
            </section>
            {/* Модальное окно создания новости */}
            <NewsModalBuilder
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNews}
            />
        </div>
    );
}

export default Home;