const express = require('express');
const router = express.Router();
const sql = require('mssql');
const database = require('../config/database');

// GET - Lấy thống kê trạng thái công văn
router.get('/', async (req, res) => {
    try {
        const pool = database.getPool();

        const result = await pool.request().query(`
      SELECT 
        'Văn bản đã xử lí' as status,
        COUNT(*) as count
      FROM CongVan 
      WHERE ket_qua_xu_ly = N'Đã xử lí'
      
      UNION ALL
      
      SELECT 
        'Văn bản chưa xử lí' as status,
        COUNT(*) as count
      FROM CongVan 
      WHERE ket_qua_xu_ly = N'Chưa xử lí'
      
      UNION ALL
      
      SELECT 
        'Văn bản đã bút phê' as status,
        COUNT(*) as count
      FROM CongVan 
      WHERE lanh_dao_but_phe != N'Chưa' AND lanh_dao_but_phe IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'Văn bản chưa bút phê' as status,
        COUNT(*) as count
      FROM CongVan 
      WHERE lanh_dao_but_phe = N'Chưa' OR lanh_dao_but_phe IS NULL
    `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// GET - Thống kê chi tiết theo tháng
router.get('/monthly', async (req, res) => {
    try {
        const { year } = req.query;
        const pool = database.getPool();

        const result = await pool.request()
            .input('year', sql.Int, year || new Date().getFullYear())
            .query(`
        SELECT 
          MONTH(created_at) as month,
          COUNT(*) as total_documents,
          SUM(CASE WHEN ket_qua_xu_ly = N'Đã xử lí' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN ket_qua_xu_ly = N'Chưa xử lí' THEN 1 ELSE 0 END) as pending
        FROM CongVan 
        WHERE YEAR(created_at) = @year
        GROUP BY MONTH(created_at)
        ORDER BY MONTH(created_at)
      `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê tháng:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// GET - Thống kê theo phòng ban
router.get('/department', async (req, res) => {
    try {
        const pool = database.getPool();

        const result = await pool.request().query(`
      SELECT 
        ban_hanh as department,
        COUNT(*) as total_documents,
        SUM(CASE WHEN ket_qua_xu_ly = N'Đã xử lí' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN ket_qua_xu_ly = N'Chưa xử lí' THEN 1 ELSE 0 END) as pending
      FROM CongVan 
      GROUP BY ban_hanh
      ORDER BY COUNT(*) DESC
    `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy thống kê phòng ban:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;