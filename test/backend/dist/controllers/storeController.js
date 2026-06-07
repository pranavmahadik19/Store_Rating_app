"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRating = exports.getStores = void 0;
const db_1 = require("../config/db");
const getStores = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            return;
        }
        const userId = req.user.id;
        const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
        const allowedSortBy = ['name', 'address', 'rating', 'user_rating'];
        const allowedSortOrder = ['asc', 'desc'];
        const sortColumn = allowedSortBy.includes(String(sortBy)) ? String(sortBy) : 'name';
        const order = allowedSortOrder.includes(String(sortOrder).toLowerCase())
            ? String(sortOrder).toUpperCase()
            : 'ASC';
        // First parameter in query is for the user_rating subquery
        const params = [userId];
        const whereClauses = [];
        if (name) {
            whereClauses.push('s.name LIKE ?');
            params.push(`%${name}%`);
        }
        if (address) {
            whereClauses.push('s.address LIKE ?');
            params.push(`%${address}%`);
        }
        let sql = `
      SELECT 
        s.id, s.name, s.address, s.email,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as rating_count,
        (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }
        sql += ' GROUP BY s.id';
        if (sortColumn === 'rating') {
            sql += ` ORDER BY rating ${order}`;
        }
        else if (sortColumn === 'user_rating') {
            sql += ` ORDER BY user_rating ${order}`;
        }
        else {
            sql += ` ORDER BY s.${sortColumn} ${order}`;
        }
        const stores = await (0, db_1.query)(sql, params);
        const formattedStores = stores.map((s) => ({
            ...s,
            rating: parseFloat(parseFloat(s.rating).toFixed(2)),
            user_rating: s.user_rating ? parseInt(s.user_rating) : null,
        }));
        res.status(200).json({
            status: 'success',
            data: formattedStores,
        });
    }
    catch (error) {
        console.error('User get stores error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getStores = getStores;
const submitRating = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            return;
        }
        const userId = req.user.id;
        const storeId = parseInt(req.params.storeId);
        const { rating } = req.body;
        // Check if store exists
        const stores = await (0, db_1.query)('SELECT id FROM stores WHERE id = ?', [storeId]);
        if (stores.length === 0) {
            res.status(404).json({ status: 'fail', message: 'Store not found' });
            return;
        }
        // Insert or update rating
        // In MySQL, "ON DUPLICATE KEY UPDATE" handles both create and modify!
        await (0, db_1.query)(`INSERT INTO ratings (user_id, store_id, rating) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`, [userId, storeId, rating]);
        res.status(200).json({
            status: 'success',
            message: 'Rating submitted successfully',
            data: { storeId, rating },
        });
    }
    catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.submitRating = submitRating;
