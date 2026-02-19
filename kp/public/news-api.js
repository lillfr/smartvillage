const API_BASE_URL = 'http://localhost:3000/api/news';


export const NewsAPI = {
    async getNews(searchTerm = '') {
        const url = searchTerm ? `${API_BASE_URL}?q=${encodeURIComponent(searchTerm)}` : API_BASE_URL;
        const response = await fetch(url);
        return await response.json();
    },

    async getNewsById(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        return await response.json();
    },

    async addNews(newsData) {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsData)
        });
        return await response.json();
    },

    async updateNews(id, newsData) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsData)
        });
        return await response.json();
    },

    async deleteNews(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    }
};