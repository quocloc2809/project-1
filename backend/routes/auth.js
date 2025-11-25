const express = require('express');
const router = express.Router();
const sql = require('mssql');
const crypto = require('crypto');
const database = require('../config/database');

// Helper function to hash password with salt
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Helper function to generate salt
function generateSalt() {
    return crypto.randomBytes(16).toString('hex');
}

// POST /api/auth/login
// Authenticates user with username and password
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập và mật khẩu là bắt buộc'
            });
        }

        const pool = database.getPool();
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .query(`
                SELECT 
                    UserID, 
                    Username, 
                    PasswordHash, 
                    Salt, 
                    FullName, 
                    Email,
                    IsActive,
                    Role
                FROM dbo.Users 
                WHERE Username = @username
            `);

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        const user = result.recordset[0];

        // Check if user is active
        if (!user.IsActive) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị vô hiệu hóa'
            });
        }

        // Verify password
        const hashedPassword = hashPassword(password, user.Salt);
        if (hashedPassword !== user.PasswordHash) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
        }

        // Update last login time
        await pool.request()
            .input('userId', sql.Int, user.UserID)
            .query(`
                UPDATE dbo.Users 
                SET LastLoginDate = GETDATE() 
                WHERE UserID = @userId
            `);

        // Return user info (exclude sensitive fields)
        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                userId: user.UserID,
                username: user.Username,
                fullName: user.FullName,
                email: user.Email,
                role: user.Role
            }
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// POST /api/auth/register (optional - for admin to create users)
router.post('/register', async (req, res) => {
    try {
        const { username, password, fullName, email, role } = req.body;

        if (!username || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập, mật khẩu và họ tên là bắt buộc'
            });
        }

        const pool = database.getPool();

        // Check if username already exists
        const checkResult = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .query('SELECT UserID FROM dbo.Users WHERE Username = @username');

        if (checkResult.recordset.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại'
            });
        }

        // Generate salt and hash password
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);

        // Insert new user
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .input('passwordHash', sql.NVarChar(200), passwordHash)
            .input('salt', sql.NVarChar(50), salt)
            .input('fullName', sql.NVarChar(100), fullName)
            .input('email', sql.NVarChar(100), email || null)
            .input('role', sql.NVarChar(20), role || 'user')
            .query(`
                INSERT INTO dbo.Users (Username, PasswordHash, Salt, FullName, Email, Role, IsActive, CreatedDate)
                VALUES (@username, @passwordHash, @salt, @fullName, @email, @role, 1, GETDATE());
                
                SELECT SCOPE_IDENTITY() AS UserID;
            `);

        const newUserId = result.recordset[0].UserID;

        res.status(201).json({
            success: true,
            message: 'Tạo tài khoản thành công',
            data: {
                userId: newUserId,
                username: username,
                fullName: fullName
            }
        });

    } catch (error) {
        console.error('Lỗi tạo tài khoản:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        const pool = database.getPool();

        // Get current user info
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT PasswordHash, Salt FROM dbo.Users WHERE UserID = @userId');

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        const user = result.recordset[0];

        // Verify old password
        const oldHashedPassword = hashPassword(oldPassword, user.Salt);
        if (oldHashedPassword !== user.PasswordHash) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu cũ không đúng'
            });
        }

        // Generate new salt and hash new password
        const newSalt = generateSalt();
        const newPasswordHash = hashPassword(newPassword, newSalt);

        // Update password
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('passwordHash', sql.NVarChar(200), newPasswordHash)
            .input('salt', sql.NVarChar(50), newSalt)
            .query(`
                UPDATE dbo.Users 
                SET PasswordHash = @passwordHash, 
                    Salt = @salt,
                    UpdatedDate = GETDATE()
                WHERE UserID = @userId
            `);

        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });

    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;
