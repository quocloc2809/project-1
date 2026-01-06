const express = require('express');
const cors = require('cors');
require('dotenv').config();

const database = require('../../shared/config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - [Auth Service] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'auth',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Auth Service Error]:', err);
    res.status(500).json({
        success: false,
        message: 'Auth service internal error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found in auth service'
    });
});

// Start server
async function startServer() {
    try {
        await database.connect();
        app.listen(PORT, () => {
            console.log(`🔐 Auth Service running at: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error starting auth service:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down auth service...');
    await database.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Shutting down auth service...');
    await database.disconnect();
    process.exit(0);
});

startServer();
