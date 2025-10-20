const express = require('express');
const router = express.Router();
const sql = require('mssql');
const database = require('../config/database');

const COLUMN_SETS = {
    MAIN_VIEW: [
        'DocumentID', 'DocumentNo', 'CreatedDate', 'DocumentSummary', 'UpdatedDate',
        'ExpiredDate', 'AssignedReviewedFullname', 'Status',
        'IssuedOrganizationGroupID', 'SentOrganizationGroupID', 'IssuedOrganizationID', 'ReviewNote'
    ],

    DETAIL: '*'
};

router.get('/', async (req, res) => {
    try {
        const pool = database.getPool();

        const view = req.query.view || 'MAIN_VIEW';
        const columns = COLUMN_SETS[view] || COLUMN_SETS.MAIN_VIEW;

        const columnStr = Array.isArray(columns) ? columns.join(', ') : columns;

        const result = await pool.request().query(`
            SELECT ${columnStr}
            FROM dbo.WF_Incoming_Docs
            ORDER BY CreatedDate DESC
        `);

        res.json({
            success: true,
            data: result.recordset,
            view: view,
            columns_used: Array.isArray(columns) ? columns : 'all'
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách công văn:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = database.getPool();

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM dbo.WF_Incoming_Docs WHERE DocumentID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công văn'
            });
        }

        res.json({
            success: true,
            data: result.recordset[0]
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin công văn:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

// PUT - Cập nhật trạng thái và ghi chú công văn
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Status, ReviewNote } = req.body;

        console.log('PUT /api/documents/:id - Request params:', { id });
        console.log('PUT /api/documents/:id - Request body:', { Status, ReviewNote });

        const pool = database.getPool();

        // Chuyển đổi Status từ text sang số (0: Chưa hoàn thành, 1: Đã hoàn thành)
        let statusValue = 0;
        if (Status === 'Đã hoàn thành' || Status === '1' || Status === 1) {
            statusValue = 1;
        }

        console.log('PUT /api/documents/:id - Status value:', statusValue);

        // Kiểm tra xem document có tồn tại không trước khi update
        const checkResult = await pool.request()
            .input('checkId', sql.Int, id)
            .query('SELECT DocumentID FROM dbo.WF_Incoming_Docs WHERE DocumentID = @checkId');

        console.log('PUT /api/documents/:id - Check result:', checkResult.recordset);

        if (checkResult.recordset.length === 0) {
            console.log('PUT /api/documents/:id - Document not found for ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công văn để cập nhật',
                documentId: id
            });
        }

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.Int, statusValue)
            .input('reviewNote', sql.NVarChar(sql.MAX), ReviewNote || '')
            .query(`
                UPDATE dbo.WF_Incoming_Docs SET
                    Status = @status,
                    ReviewNote = @reviewNote,
                    UpdatedDate = GETDATE()
                WHERE DocumentID = @id
            `);

        console.log('PUT /api/documents/:id - Update result:', result);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công văn để cập nhật'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật công văn thành công',
            data: {
                Status: statusValue,
                ReviewNote: ReviewNote || ''
            }
        });
    } catch (error) {
        console.error('Lỗi cập nhật công văn:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
});

module.exports = router;