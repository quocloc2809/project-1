const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sql = require('mssql');
const database = require('../config/database');

router.get('/download/:documentId', async (req, res) => {
    try {
        const documentId = parseInt(req.params.documentId, 10);
        if (isNaN(documentId)) return res.status(400).json({ success: false, message: 'Invalid documentId' });

        const pool = database.getPool();
        const result = await pool.request()
            .input('docId', sql.Int, documentId)
            .query(`SELECT TOP 1 FileID, FileName, ContentType, Size FROM dbo.WF_Incoming_Doc_Files WHERE DocumentID = @docId ORDER BY FileID DESC`);

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'No file found for this document' });
        }

        const fileRec = result.recordset[0];
        const fileNameOnDisk = fileRec.FileName || '';
        const contentType = fileRec.ContentType || 'application/octet-stream';

        const storageRoot = process.env.FILE_STORAGE_ROOT || path.join(__dirname, '..', 'uploads');

        let relativePath = fileNameOnDisk.replace(/^\//, '');
        const fullPath = path.resolve(storageRoot, relativePath);

        if (!fullPath.startsWith(path.resolve(storageRoot))) {
            console.warn('Attempt to access file outside storage root:', fullPath);
            return res.status(400).json({ success: false, message: 'Invalid file path' });
        }

        if (!fs.existsSync(fullPath)) {
            console.warn('Requested file not found on disk:', fullPath);
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        const baseName = path.basename(fullPath);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);

        const stream = fs.createReadStream(fullPath);
        stream.pipe(res);
        stream.on('error', (err) => {
            console.error('File stream error:', err);
            if (!res.headersSent) res.status(500).json({ success: false, message: 'Error streaming file' });
        });
    } catch (error) {
        console.error('Error in file download route:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
