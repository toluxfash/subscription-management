// server/utils/BaseRepository.js
const logger = require('./logger');

class BaseRepository {
    constructor(db, tableName) {
        this.db = db; // db is a mysql2/promise pool
        this.tableName = tableName;
    }

    // Find all records
    async findAll({ filters = {}, orderBy, limit, offset } = {}) {
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];

        const whereConditions = Object.entries(filters)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key]) => `${key} = ?`);

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
            params.push(...Object.values(filters).filter(v => v !== undefined && v !== null));
        }

        if (orderBy) query += ` ORDER BY ${orderBy}`;
        if (limit) {
            query += ` LIMIT ?`;
            params.push(limit);
            if (offset) {
                query += ` OFFSET ?`;
                params.push(offset);
            }
        }

        const [rows] = await this.db.query(query, params);
        return rows;
    }

    // Find by ID
    async findById(id, idField = 'id') {
        const [rows] = await this.db.query(`SELECT * FROM ${this.tableName} WHERE ${idField} = ?`, [id]);
        return rows[0] || null;
    }

    // Find one by filters
    async findOne(filters = {}) {
        const results = await this.findAll({ filters, limit: 1 });
        return results[0] || null;
    }

    // Create record
    async create(data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');
        const query = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        const [result] = await this.db.query(query, values);
        return { insertId: result.insertId, affectedRows: result.affectedRows };
    }

    // Update record by ID
    async update(id, data, idField = 'id') {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${idField} = ?`;
        const [result] = await this.db.query(query, [...values, id]);
        return { affectedRows: result.affectedRows };
    }

    // Delete record by ID
    async delete(id, idField = 'id') {
        const [result] = await this.db.query(`DELETE FROM ${this.tableName} WHERE ${idField} = ?`, [id]);
        return { affectedRows: result.affectedRows };
    }

    // Count with filters
    async count(filters = {}) {
        let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
        const params = [];

        const whereConditions = Object.entries(filters)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key]) => `${key} = ?`);

        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
            params.push(...Object.values(filters).filter(v => v !== undefined && v !== null));
        }

        const [rows] = await this.db.query(query, params);
        return rows[0]?.count || 0;
    }

    // Check existence
    async exists(filters = {}) {
        return (await this.count(filters)) > 0;
    }
}

module.exports = BaseRepository;
