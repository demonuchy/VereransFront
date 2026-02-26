import { useCallback, useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import NewsModalBuilder from "../components/NewsModalBuilder";
import LoadScreen from "../components/LoadScreen";
import useApi from "../hooks/useApi";
import { useAuth } from '../hooks/useAuthContext';

function Home() {
    const [news, setNews] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { createNews, getAllNews, deleteNewsById } = useApi(); // Добавляем deleteNews
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
            console.log("Edit mode", !editMode);
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

    // Добавляем обработчик удаления
    const handleDeleteNews = useCallback(async (newsId) => {
        try {
            setIsLoading(true);
            await deleteNewsById(newsId, localStorage.getItem('accessToken'));
            setNews(prevNews => prevNews.filter(item => item.id !== newsId));
        } catch (error) {
            console.error('Error deleting news:', error);
            throw error; // Пробрасываем ошибку для обработки в компоненте
        } finally {
            setIsLoading(false);
        }
    }, [deleteNewsById]);

    if (isLoading && !news) {
        return <LoadScreen />;
    }

    if (news?.length === 0) {
        return (
            <>
                <div className="home-container">
                    <div className="empty-state">
                        <div className="empty-state-icon">📰</div>
                        <h2 className="empty-state-title">Новостей пока нет</h2>
                        <p className="empty-state-message">
                            Будьте первым, кто поделится важной новостью с сообществом!
                        </p>
                        {(user?.role === "admin" || user?.role === "root") && 
                            <button 
                                className="empty-state-button"
                                onClick={() => setIsModalOpen(true)}
                            >
                                + Создать новость
                            </button>
                        }
                    </div>
                </div>

                <NewsModalBuilder
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveNews}
                />
            </>
        );
    }

    return (
        <>
            <div className="home-container">
                <div 
                    className="news-card--container" 
                    onDoubleClick={doubleClickHandler}
                >
                    {news?.map((item) => (
                        <NewsCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            date={item.created_at}
                            image={item.images?.[0]?.base64 || null}
                            editMode={editMode && (user?.role === "admin" || user?.role === "root")}
                            onDelete={handleDeleteNews} // Передаем обработчик удаления
                        />
                    ))}  
                    {((user?.role === "admin" || user?.role === "root") && editMode) && 
                        <button 
                            className="add-news-button"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span>Создать новость</span>
                        </button>
                    }
                </div>
            </div>

            <NewsModalBuilder
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNews}
            />
        </>
    );
}

export default Home;