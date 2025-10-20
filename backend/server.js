const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const database = require('./config/database');
const documentsRoutes = require('./routes/documents');
const statisticsRoutes = require('./routes/statistics');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'API Văn Phòng Điện Tử đang hoạt động!',
        version: '1.0.0',
        endpoints: {
            documents: '/api/documents',
            statistics: '/api/statistics'
        }
    });
});

app.use('/api/documents', documentsRoutes);
app.use('/api/statistics', statisticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Lỗi server:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi server nội bộ',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tìm thấy'
    });
});

// Khởi tạo server
async function startServer() {
    try {
        // Kết nối database
        await database.connect();

        // Khởi động server
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
            console.log(`📊 API Endpoints:`);
            console.log(`   - GET  /api/documents      - Lấy danh sách công văn`);
            console.log(`   - POST /api/documents      - Tạo công văn mới`);
            console.log(`   - GET  /api/documents/:id  - Lấy chi tiết công văn`);
            console.log(`   - PUT  /api/documents/:id  - Cập nhật công văn`);
            console.log(`   - DELETE /api/documents/:id - Xóa công văn`);
            console.log(`   - GET  /api/statistics     - Thống kê trạng thái`);
            console.log(`   - GET  /api/statistics/monthly - Thống kê theo tháng`);
            console.log(`   - GET  /api/statistics/department - Thống kê theo phòng ban`);
        });
    } catch (error) {
        console.error('❌ Lỗi khởi động server:', error);
        process.exit(1);
    }
}

// Xử lý shutdown gracefully
process.on('SIGTERM', async () => {
    console.log('🔄 Đang shutdown server...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Đang shutdown server...');
    await database.disconnect();
    process.exit(0);
});

// Khởi động
startServer();