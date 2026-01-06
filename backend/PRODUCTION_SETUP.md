# 🚀 Production Deployment Checklist

## ✅ **1. SECURITY (Bắt buộc)**

### 1.1 Environment Variables
- [ ] Đổi tất cả passwords trong `.env.production`
- [ ] Không commit `.env` files vào Git
- [ ] Dùng secrets manager (AWS Secrets Manager, Azure Key Vault)
- [ ] Set `NODE_ENV=production` trên server

### 1.2 Database Security
- [ ] Đổi DB password mạnh (min 16 ký tự, có số + ký tự đặc biệt)
- [ ] Enable SSL/TLS cho database: `DB_ENCRYPT=true`
- [ ] Tạo DB user riêng cho app (không dùng `sa` hoặc `root`)
- [ ] Giới hạn quyền DB user: chỉ SELECT, INSERT, UPDATE, DELETE (không DROP, CREATE)
- [ ] Enable database backup tự động

### 1.3 API Security
```bash
cd api-gateway
npm install helmet express-rate-limit
```

Uncomment các dòng security trong `api-gateway/server.js`:
- `helmet()` - HTTP headers security
- `rateLimit()` - Giới hạn requests/IP

### 1.4 CORS
- [ ] Chỉ cho phép domain production: `FRONTEND_URL=https://your-domain.com`
- [ ] Không dùng wildcard `*`

### 1.5 Error Messages
- [ ] Không expose stack trace ra client khi `NODE_ENV=production`
- [ ] Log errors vào file thay vì console

---

## ✅ **2. PERFORMANCE**

### 2.1 Database Connection Pooling
```javascript
// shared/config/database.js - ĐÃ CÓ
pool: {
    max: 20,          // Tăng lên cho production
    min: 5,           // Giữ min connections
    idleTimeoutMillis: 30000
}
```

### 2.2 Compression
```bash
npm install compression
```

Thêm vào API Gateway:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2.3 Caching
- [ ] Add Redis cho session caching
- [ ] Cache departments/static data

---

## ✅ **3. MONITORING & LOGGING**

### 3.1 Structured Logging
```bash
npm install winston
```

### 3.2 Health Checks đầy đủ
Thêm DB health check:
```javascript
app.get('/health', async (req, res) => {
    const dbStatus = await database.getPool().request().query('SELECT 1');
    res.json({
        status: dbStatus ? 'healthy' : 'unhealthy',
        database: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});
```

### 3.3 Monitoring Tools
- [ ] Setup PM2 cho auto-restart
- [ ] Application Insights / New Relic
- [ ] Uptime monitoring (Pingdom, UptimeRobot)

---

## ✅ **4. DEPLOYMENT**

### 4.1 Process Manager
```bash
npm install -g pm2

# Start all services with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4.2 Reverse Proxy
- [ ] Setup Nginx làm reverse proxy trước API Gateway
- [ ] Enable HTTPS/SSL certificate (Let's Encrypt)
- [ ] Redirect HTTP → HTTPS

### 4.3 Container (Recommended)
```bash
# Docker Compose cho tất cả services
docker-compose -f docker-compose.prod.yml up -d
```

---

## ✅ **5. DATABASE**

### 5.1 Migration Script
- [ ] Tạo script để migrate từ dev → production
- [ ] Backup database trước khi deploy

### 5.2 Indexes
```sql
-- Thêm indexes cho performance
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Documents_CreatedDate ON WF_Incoming_Docs(CreatedDate);
```

---

## ✅ **6. FIXES CẦN LÀM NGAY**

### 6.1 Critical
- [x] **Bỏ mock login** trong Auth Service
- [ ] **Uncomment database query** trong auth.js
- [ ] Test login với database thật

### 6.2 Important
- [ ] Thêm input validation (express-validator)
- [ ] SQL injection prevention (parameterized queries - ĐÃ CÓ)
- [ ] XSS prevention
- [ ] CSRF protection

### 6.3 Database Timeout
Tăng timeout cho production:
```javascript
// shared/config/database.js
connectionTimeout: 15000,  // 15s
requestTimeout: 30000      // 30s
```

---

## ✅ **7. TESTING TRƯỚC KHI GO LIVE**

### 7.1 Load Testing
```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://your-api/api/auth/login
```

### 7.2 Security Scan
```bash
npm audit
npm audit fix
```

### 7.3 Manual Tests
- [ ] Login/Logout
- [ ] CRUD documents
- [ ] File upload/download
- [ ] API timeout handling
- [ ] Error messages (không expose sensitive info)

---

## ✅ **8. POST-DEPLOYMENT**

### 8.1 Immediate
- [ ] Verify all services running: `pm2 status`
- [ ] Check logs: `pm2 logs`
- [ ] Test production URL
- [ ] Monitor error rate

### 8.2 Week 1
- [ ] Daily log reviews
- [ ] Performance monitoring
- [ ] User feedback

---

## 📦 **Quick Install Commands**

```bash
# API Gateway
cd api-gateway
npm install helmet express-rate-limit compression

# Shared (if needed)
cd ../shared
npm install winston

# All services
cd ..
npm run install-all  # Create this script in root package.json
```

---

## 🔥 **Emergency Rollback Plan**

1. Keep backup của database trước khi deploy
2. Keep previous version code
3. PM2 rollback: `pm2 reload ecosystem.config.js --update-env`
4. Database restore: `sqlcmd -i backup.sql`

---

## 📞 **Support Contacts**

- DevOps: [contact]
- Database Admin: [contact]
- On-call Engineer: [contact]

