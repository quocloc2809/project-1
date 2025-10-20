const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

class Database {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            this.pool = await sql.connect(config);
            console.log('Kết nối SQL Server thành công!');
            return this.pool;
        } catch (error) {
            console.error('Lỗi kết nối SQL Server:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.pool) {
                await this.pool.close();
                console.log('Đã ngắt kết nối SQL Server');
            }
        } catch (error) {
            console.error('Lỗi ngắt kết nối:', error);
        }
    }

    getPool() {
        return this.pool;
    }
}

const database = new Database();

module.exports = database;