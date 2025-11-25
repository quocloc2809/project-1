const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const database = require('./config/database');
const documentsRoutes = require('./routes/incoming-documents');
const outgoingDocumentsRoutes = require('./routes/outgoing-documents');
const departmentsRoutes = require('./routes/departments');
const filesRoutes = require('./routes/files');
const authRoutes = require('./routes/auth');

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
            documents: '/api/incoming-documents',
            outgoingDocuments: '/api/outgoing-documents',
            departments: '/api/departments'
        }
    });
});

app.use('/api/incoming-documents', documentsRoutes);
app.use('/api/outgoing-documents', outgoingDocumentsRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/auth', authRoutes);

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