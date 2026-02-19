import { Database as SQLiteDatabase } from 'bun:sqlite';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    createdAt: string;
}

export class Database {
    private db: SQLiteDatabase;

    constructor() {
        // Открываем/создаем базу данных
        this.db = new SQLiteDatabase("news.db", { create: true });
        
        // Оптимизация для production
        this.db.exec("PRAGMA journal_mode = WAL");
        this.db.exec("PRAGMA synchronous = NORMAL");
        
        // Создаем таблицу
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    getNews(searchTerm: string = ''): NewsItem[] {
        try {
            if (searchTerm) {
                const stmt = this.db.prepare(`
                    SELECT id, title, content, 
                           strftime('%Y-%m-%d %H:%M:%S', createdAt) as createdAt
                    FROM news 
                    WHERE title LIKE ? OR content LIKE ?
                    ORDER BY createdAt DESC
                `);
                return stmt.all('%${searchTerm}%, %${searchTerm}%') as NewsItem[];
            }
            
            const stmt = this.db.prepare(`
                SELECT id, title, content, 
                       strftime('%Y-%m-%d %H:%M:%S', createdAt) as createdAt
                FROM news 
                ORDER BY createdAt DESC
            `);
            return stmt.all() as NewsItem[];
        } catch (error) {
            console.error('Error getting news:', error);
            return [];
        }
    }

    addNews(data: { title: string; content: string }): NewsItem | null {
        try {
            const stmt = this.db.prepare(`
                INSERT INTO news (title, content)
                VALUES (?1, ?2)
                RETURNING id, title, content, 
                          strftime('%Y-%m-%d %H:%M:%S', createdAt) as createdAt
            `);
            
            const result = stmt.get(data.title, data.content) as NewsItem | undefined;
            return result ?? null;
        } catch (error) {
            console.error('Error adding news:', error);
            return null;
        }
    }

    updateNews(id: string, data: { title?: string; content?: string }): NewsItem | null {
        try {
            // Сначала получаем текущую запись
            const getStmt = this.db.prepare(`
                SELECT id, title, content, 
                       strftime('%Y-%m-%d %H:%M:%S', createdAt) as createdAt
                FROM news 
                WHERE id = ?
            `);
            const existing = getStmt.get(id) as NewsItem | undefined;
            
            if (!existing) return null;

            // Обновляем только указанные поля
            const title = data.title ?? existing.title;
            const content = data.content ?? existing.content;

            const updateStmt = this.db.prepare(`
                UPDATE news 
                SET title = ?1, content = ?2
                WHERE id = ?3
                RETURNING id, title, content, 
                          strftime('%Y-%m-%d %H:%M:%S', createdAt) as createdAt
            `);
            
            const result = updateStmt.get(title, content, id) as NewsItem | undefined;
            return result ?? null;
        } catch (error) {
            console.error('Error updating news:', error);
            return null;
        }
    }

    deleteNews(id: string): boolean {
        try {
            const stmt = this.db.prepare("DELETE FROM news WHERE id = ?");
            const result = stmt.run(id);
            return result.changes > 0;
        } catch (error) {
            console.error('Error deleting news:', error);
            return false;
        }
    }

    // Закрытие соединения (вызывать при завершении работы)
    close() {
        this.db.close();
    }
}