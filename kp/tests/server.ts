import express from "express";

const app = express();

app.get("/api/news", (req, res) => {
  // Верните тестовые данные - массив новостей
  res.json([
    { id: 1, title: "Новость 1", date: "2025-05-04" },
    { id: 2, title: "Новость 2", date: "2025-05-05" }
  ]);
});

export default app;
