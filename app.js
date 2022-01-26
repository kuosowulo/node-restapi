const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

const globalErrHandler = require('./controllers/errorController');
const AppError = require('./utils/appError.js');

const app = express();

// 允許跨域請求
app.use(cors());

// 設定安全HTTP headers
app.use(helmet());

// 限制同一個IP的請求數量
const limiter = rateLimit({
    max: 150,
    windowMs: 60 * 60 * 1000,
    message: 'Too Many Request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// 解析請求
app.use(express.json({
    limit: '15kb'
}))

// 避免Nosql query injection
app.use(mongoSanitize());

// 過濾xss
app.use(xss());

// 避免參數汙染
app.use(hpp());

// Routes
app.use('/api/v1/users', require('./routes/userRoutes'));

// handle undefined Routes
app.use('*', (req, res, next) => {
    const err = new AppError(404, 'fail', 'undefined route');
    next(err, req, res, next);
});
app.use(globalErrHandler);

module.exports = app;