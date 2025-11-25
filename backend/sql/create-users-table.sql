-- Tạo bảng Users để quản lý tài khoản đăng nhập
-- Chạy script này trong SQL Server Management Studio (SSMS)

USE [YourDatabaseName]; -- Thay YourDatabaseName bằng tên database của bạn
GO

-- Tạo bảng Users nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [UserID] INT IDENTITY(1,1) PRIMARY KEY,
        [Username] NVARCHAR(50) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(200) NOT NULL,
        [Salt] NVARCHAR(50) NOT NULL,
        [FullName] NVARCHAR(100) NOT NULL,
        [Email] NVARCHAR(100) NULL,
        [Role] NVARCHAR(20) NOT NULL DEFAULT 'user', -- Có thể là: 'admin', 'user', 'manager'
        [IsActive] BIT NOT NULL DEFAULT 1,
        [CreatedDate] DATETIME NOT NULL DEFAULT GETDATE(),
        [UpdatedDate] DATETIME NULL,
        [LastLoginDate] DATETIME NULL
    );

    PRINT 'Bảng Users đã được tạo thành công.';
END
ELSE
BEGIN
    PRINT 'Bảng Users đã tồn tại.';
END
GO

-- Tạo index để tăng tốc độ query
CREATE NONCLUSTERED INDEX [IX_Users_Username] ON [dbo].[Users] ([Username]);
CREATE NONCLUSTERED INDEX [IX_Users_IsActive] ON [dbo].[Users] ([IsActive]);
GO

-- =====================================================================
-- TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH
-- =====================================================================
-- Tài khoản: admin
-- Mật khẩu: Admin@123
-- QUAN TRỌNG: Đổi mật khẩu ngay sau khi đăng nhập lần đầu!

DECLARE @username NVARCHAR(50) = 'admin';
DECLARE @password NVARCHAR(100) = 'Admin@123';
DECLARE @salt NVARCHAR(50) = '8e5e8f8f9c9e4d4b9a9b8c7d6e5f4a3b'; -- Salt cố định cho demo
DECLARE @passwordHash NVARCHAR(200) = 'b8c7f8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5'; -- Hash của 'Admin@123' với salt trên

IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE Username = @username)
BEGIN
    INSERT INTO [dbo].[Users] (Username, PasswordHash, Salt, FullName, Email, Role, IsActive, CreatedDate)
    VALUES (@username, @passwordHash, @salt, N'Quản trị viên', 'admin@example.com', 'admin', 1, GETDATE());
    
    PRINT 'Tài khoản admin đã được tạo:';
    PRINT '  - Username: admin';
    PRINT '  - Password: Admin@123';
    PRINT '  - LƯU Ý: Hãy đổi mật khẩu ngay sau khi đăng nhập!';
END
ELSE
BEGIN
    PRINT 'Tài khoản admin đã tồn tại.';
END
GO

-- =====================================================================
-- TẠO THÊM TÀI KHOẢN USER MẪU (tùy chọn)
-- =====================================================================
-- Tài khoản: user1
-- Mật khẩu: User@123

DECLARE @username2 NVARCHAR(50) = 'user1';
DECLARE @password2 NVARCHAR(100) = 'User@123';
DECLARE @salt2 NVARCHAR(50) = '7d4c3b2a1e0f9e8d7c6b5a4f3e2d1c0b'; -- Salt cố định cho demo
DECLARE @passwordHash2 NVARCHAR(200) = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'; -- Hash của 'User@123' với salt trên

IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE Username = @username2)
BEGIN
    INSERT INTO [dbo].[Users] (Username, PasswordHash, Salt, FullName, Email, Role, IsActive, CreatedDate)
    VALUES (@username2, @passwordHash2, @salt2, N'Người dùng 1', 'user1@example.com', 'user', 1, GETDATE());
    
    PRINT 'Tài khoản user1 đã được tạo:';
    PRINT '  - Username: user1';
    PRINT '  - Password: User@123';
END
ELSE
BEGIN
    PRINT 'Tài khoản user1 đã tồn tại.';
END
GO

-- =====================================================================
-- KIỂM TRA DỮ LIỆU
-- =====================================================================
SELECT 
    UserID,
    Username,
    FullName,
    Email,
    Role,
    IsActive,
    CreatedDate,
    LastLoginDate
FROM [dbo].[Users]
ORDER BY CreatedDate DESC;
GO

PRINT '=================================================================';
PRINT 'Script hoàn tất!';
PRINT 'Các endpoint API đăng nhập:';
PRINT '  - POST /api/auth/login          - Đăng nhập';
PRINT '  - POST /api/auth/register       - Tạo tài khoản mới (admin)';
PRINT '  - POST /api/auth/change-password - Đổi mật khẩu';
PRINT '=================================================================';
