const express = require('express');
const router = express.Router();
const database = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const pool = database.getPool();

        const result = await pool.request().query(`
            SELECT DISTINCT 
                GroupID, 
                GroupName 
            FROM dbo.Core_V_Users 
            WHERE GroupID IS NOT NULL 
                AND GroupName IS NOT NULL 
                AND GroupName != ''
            ORDER BY GroupName
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách đơn vị:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;