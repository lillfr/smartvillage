import { NewsAPI } from './news-api.js';

document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('newsContainer');
    const addNewsBtn = document.getElementById('addNewsBtn');
    const searchInput = document.getElementById('searchInput');
    const newsModal = new bootstrap.Modal(document.getElementById('newsModal'));
    const saveNewsBtn = document.getElementById('saveNewsBtn');
    const newsForm = document.getElementById('newsForm');
    const modalTitle = document.getElementById('modalTitle');
    
    let editingId = null;

    // Загрузка новостей при открытии страницы
    loadNews();

    // Обработчик добавления новости
    addNewsBtn.addEventListener('click', () => {
        editingId = null;
        newsForm.reset();
        modalTitle.textContent = 'Добавить новость';
        newsModal.show();
    });

    // Обработчик сохранения новости
    saveNewsBtn.addEventListener('click', async () => {
        const newsData = {
            date: document.getElementById('newsDate').value,
            title: document.getElementById('newsTitle').value,
            content: document.getElementById('newsContent').value
        };

        if (editingId) {
            await NewsAPI.updateNews(editingId, newsData);
        } else {
            await NewsAPI.addNews(newsData);
        }

        newsModal.hide();
        loadNews();
    });

    // Поиск новостей
    searchInput.addEventListener('input', debounce(() => {
        loadNews(searchInput.value);
    }, 300));

    // Функция загрузки новостей
    async function loadNews(searchTerm = '') {
        const news = await NewsAPI.getNews(searchTerm);
        renderNews(news);
    }

    // Функция отрисовки новостей
    function renderNews(news) {
        newsContainer.innerHTML = '';
        
        if (news.length === 0) {
            newsContainer.innerHTML = '<div class="col-12 text-center py-5"><p>Новостей не найдено</p></div>';
            return;
        }

        news.forEach(item => {
            const newsCard = document.createElement('div');
            newsCard.className = 'col-md-6';
            newsCard.innerHTML = `
                <div class="news-card">
                    <div class="news-date">${formatDate(item.date)}</div>
                    <h3 class="news-title">${item.title}</h3>
                    <p>${item.content}</p>
                    <div class="news-actions">
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${item.id}">Редактировать</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">Удалить</button>
                    </div>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });

        // Добавляем обработчики для кнопок редактирования и удаления
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                editingId = e.target.dataset.id;
                const newsItem = await NewsAPI.getNewsById(editingId);
                
                document.getElementById('newsId').value = newsItem.id;
                document.getElementById('newsDate').value = newsItem.date;
                document.getElementById('newsTitle').value = newsItem.title;
                document.getElementById('newsContent').value = newsItem.content;
                
                modalTitle.textContent = 'Редактировать новость';
                newsModal.show();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Вы уверены, что хотите удалить эту новость?')) {
                    await NewsAPI.deleteNews(e.target.dataset.id);
                    loadNews();
                }
            });
        });
    }

    // Вспомогательная функция для форматирования даты
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    // Функция для дебаунса (задержки выполнения при частых вызовах)
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
});