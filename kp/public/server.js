const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

// Используем body-parser для обработки POST-запросов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Устанавливаем статические файлы

// Подключение к базе данных
const db = mysql.createConnection({
    host: 'localhost',
    user: 'username', // замените на ваше имя пользователя
    password: 'password', // замените на ваш пароль
    database: 'your_database' // замените на вашу базу данных
});

// Обработка POST-запроса
app.post('/register', (req, res) => {
    const { fullName, birthDate, gender, email, phone, contractNumber, landAddress, vehicleNumber, animalsInfo, passportNumber } = req.body;

    const sql = 'INSERT INTO users (fullName, birthDate, gender, email, phone, contractNumber, landAddress, vehicleNumber, animalsInfo, passportNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [fullName, birthDate, gender, email, phone, contractNumber, landAddress, vehicleNumber, animalsInfo, passportNumber], (err, result) => {
        if (err) {
            return res.send("Ошибка: " + err);
        }
        // Перенаправление на страницу личного кабинета
        res.redirect('/cabin.html');
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает на http://localhost:${port}`);
});
