const express = require('express');
const router = express.Router();
const sql = require('mssql');
const database = require('../config/database');

router.get('/search', async (req, res) => {
    try {
        const pool = database.getPool();
        const { q } = req.query;

        let query = `
            SELECT DISTINCT
                DocumentID,
                DocumentNo,
                CreatedDate
            FROM dbo.WF_Outgoing_Docs
            WHERE 1=1
        `;

        const request = pool.request();

        if (q && q.trim()) {
            query += ` AND DocumentNo LIKE @searchTerm`;
            request.input('searchTerm', sql.NVarChar, `%${q.trim()}%`);
        }

        query += ` ORDER BY CreatedDate DESC`;

        const result = await request.query(query);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error('Lỗi tìm kiếm outgoing documents:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;