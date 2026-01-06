const express = require('express');
const router = express.Router();
const sql = require('mssql');
const database = require('../../../shared/config/database');

// Get all outgoing documents (similar structure to incoming documents)
router.get('/', async (req, res) => {
    try {
        const pool = database.getPool();

        const result = await pool.request().query(`
            SELECT DISTINCT
                doc.DocumentID, 
                doc.DocumentNo, 
                doc.CreatedDate, 
                doc.DocumentSummary, 
                doc.ExpiredDate, 
                doc.SignerPosition,
                doc.SignedUserID,
                doc.IssuedGroupID,
                COALESCE((SELECT TOP 1 Fullname FROM dbo.Core_Users WHERE UserID = doc.SignedUserID), '') as SignerFullname,
                COALESCE((SELECT TOP 1 GroupName FROM dbo.Core_Groups WHERE GroupID = doc.IssuedGroupID), '') as GroupName
            FROM dbo.WF_Outgoing_Docs doc
            ORDER BY doc.CreatedDate DESC
        `);

        res.json({
            success: true,
            data: result.recordset || []
        });

    } catch (error) {
        console.error('Lỗi lấy danh sách outgoing documents:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

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