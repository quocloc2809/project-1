const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const database = require('../../shared/config/database');
const filesRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - [Files Service] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'files',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/files', filesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Files Service Error]:', err);
    res.status(500).json({
        success: false,
        message: 'Files service internal error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found in files service'
    });
});

// Start server
async function startServer() {
    try {
        await database.connect();
        app.listen(PORT, () => {
            console.log(`📁 Files Service running at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting files service:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down files service...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Shutting down files service...');
    await database.disconnect();
    process.exit(0);
});

startServer();
