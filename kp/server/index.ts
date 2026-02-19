import { Database } from './db';
import { serve } from 'bun';
import { existsSync } from 'fs';
import { join } from 'path';

// Инициализация базы данных
const db = new Database();

// Проверка существования папки public
const publicDir = 'public';
if (!existsSync(publicDir)) {
    console.error(`Error: Directory '${publicDir}' does not exist!`);
    console.info('Create it and add news.html file');
    process.exit(1);
}

// Функция для обработки статических файлов
async function serveStaticFile(path: string): Promise<Response> {
    const filePath = join(publicDir, path);
    
    try {
        // Перенаправление корневого пути
        if (path === '/' || path === '/news.html') {
            const indexFile = Bun.file(join(publicDir, 'news.html'));
            if (await indexFile.exists()) {
                return new Response(indexFile);
            }
            return new Response('Index file not found', { status: 404 });
        }

        // Проверка существования файла
        const file = Bun.file(filePath);
        if (await file.exists()) {
            return new Response(file);
        }

        // Попробовать добавить .html если файл не найден
        const htmlFile = Bun.file(`${filePath}.html`);
        if (await htmlFile.exists()) {
            return new Response(htmlFile);
        }

        return new Response('File not found', { status: 404 });
    } catch (error) {
        console.error('Error serving static file:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Обработчик API для новостей
async function handleNewsApi(req: Request, path: string): Promise<Response> {
    try {
        const url = new URL(req.url);
        
        // GET /api/news
        if (req.method === 'GET') {
            const searchTerm = url.searchParams.get('q') || '';
            const news = db.getNews(searchTerm);
            return Response.json(news);
        }

        // POST /api/news
        if (req.method === 'POST') {
            const data = await req.json();
            if (!data.title || !data.content) {
                return new Response('Missing title or content', { status: 400 });
            }
            const newNews = db.addNews(data);
            return Response.json(newNews, { status: 201 });
        }

        // PUT /api/news/:id
        if (req.method === 'PUT') {
            const id = path.split('/')[3];
            if (!id) {
                return new Response('Missing news ID', { status: 400 });
            }
            const data = await req.json();
            const updatedNews = db.updateNews(id, data);
            if (!updatedNews) {
                return new Response('News not found', { status: 404 });
            }
            return Response.json(updatedNews);
        }

        // DELETE /api/news/:id
        if (req.method === 'DELETE') {
            const id = path.split('/')[3];
            if (!id) {
                return new Response('Missing news ID', { status: 400 });
            }
            const success = db.deleteNews(id);
            if (!success) {
                return new Response('News not found', { status: 404 });
            }
            return new Response(null, { status: 204 });
        }

        return new Response('Method not allowed', { status: 405 });
    } catch (error) {
        console.error('API Error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Запуск сервера
serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        const path = url.pathname;

        // Обработка API запросов
        if (path.startsWith('/api/news')) {
            return handleNewsApi(req, path);
        }

        // Обслуживание статических файлов
        return serveStaticFile(path);
    },
    error(error) {
        console.error('Server error:', error);
        return new Response('Internal Server Error', { status: 500 });
    },
});

console.log('Server running on http://localhost:3000');