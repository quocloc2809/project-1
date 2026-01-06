const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware (install: npm install helmet express-rate-limit)
// Uncomment for production:
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// app.use(helmet());
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api/', limiter);

// CORS - Allow only production domain in production
const allowedOrigins = NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'];

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - [Gateway] ${req.method} ${req.path}`);
    next();
});

// Service endpoints configuration
const SERVICES = {
    AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
    DOCUMENTS: process.env.DOCUMENTS_SERVICE_URL || 'http://localhost:3003',
    DEPARTMENTS: process.env.DEPARTMENTS_SERVICE_URL || 'http://localhost:3004',
    FILES: process.env.FILES_SERVICE_URL || 'http://localhost:3005'
};

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        gateway: 'running',
        timestamp: new Date().toISOString(),
        services: SERVICES
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'API Gateway - Văn Phòng Điện Tử',
        version: '2.0.0',
        architecture: 'Microservices',
        services: {
            auth: '/api/auth/*',
            incomingDocuments: '/api/incoming-documents/*',
            outgoingDocuments: '/api/outgoing-documents/*',
            departments: '/api/departments/*',
            files: '/api/files/*'
        }
    });
});

// Proxy configuration for each service
const proxyOptions = {
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.path} -> ${proxyReq.path}`);

        // Re-send body for POST/PUT requests
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
            proxyReq.end();
        }
    },
    onError: (err, req, res) => {
        console.error(`[Proxy Error] ${req.method} ${req.path}:`, err.message);
        res.status(502).json({
            success: false,
            message: 'Service unavailable',
            error: err.message
        });
    }
};

// Auth Service
app.use('/api/auth', createProxyMiddleware({
    target: SERVICES.AUTH,
    ...proxyOptions
}));

// Documents Service
app.use('/api/incoming-documents', createProxyMiddleware({
    target: SERVICES.DOCUMENTS,
    ...proxyOptions
}));

app.use('/api/outgoing-documents', createProxyMiddleware({
    target: SERVICES.DOCUMENTS,
    ...proxyOptions
}));

// Departments Service
app.use('/api/departments', createProxyMiddleware({
    target: SERVICES.DEPARTMENTS,
    ...proxyOptions
}));

// Files Service
app.use('/api/files', createProxyMiddleware({
    target: SERVICES.FILES,
    ...proxyOptions
}));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found in gateway'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Gateway Error]:', err);
    res.status(500).json({
        success: false,
        message: 'Gateway internal error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running at: http://localhost:${PORT}`);
    console.log(`📋 Services:`);
    Object.entries(SERVICES).forEach(([name, url]) => {
        console.log(`   - ${name}: ${url}`);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Shutting down API Gateway...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Shutting down API Gateway...');
    process.exit(0);
});
