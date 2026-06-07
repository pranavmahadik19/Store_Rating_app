"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOwnerDashboard = void 0;
const db_1 = require("../config/db");
const getOwnerDashboard = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Unauthorized' });
            return;
        }
        const ownerId = req.user.id;
        // Find the store owned by this user
        const stores = await (0, db_1.query)('SELECT id, name, email, address FROM stores WHERE owner_id = ?', [ownerId]);
        if (stores.length === 0) {
            // Return empty/neutral state if no store is assigned to this store owner yet
            res.status(200).json({
                status: 'success',
                data: {
                    store: null,
                    averageRating: 0,
                    ratingsCount: 0,
                    ratings: [],
                },
            });
            return;
        }
        const store = stores[0];
        const storeId = store.id;
        // Fetch average rating and count
        const stats = await (0, db_1.query)(`SELECT 
         COALESCE(AVG(rating), 0) as averageRating,
         COUNT(*) as ratingsCount 
       FROM ratings 
       WHERE store_id = ?`, [storeId]);
        const averageRating = parseFloat(parseFloat(stats[0].averageRating).toFixed(2));
        const ratingsCount = stats[0].ratingsCount;
        // Get list of users who rated, with sorting options
        const { sortBy = 'rating_date', sortOrder = 'desc' } = req.query;
        const allowedSortBy = ['user_name', 'user_email', 'rating', 'rating_date'];
        const allowedSortOrder = ['asc', 'desc'];
        const sortColumnParam = allowedSortBy.includes(String(sortBy)) ? String(sortBy) : 'rating_date';
        const order = allowedSortOrder.includes(String(sortOrder).toLowerCase())
            ? String(sortOrder).toUpperCase()
            : 'DESC';
        // Map query parameter to table column name
        let orderByColumn = 'r.created_at';
        if (sortColumnParam === 'user_name') {
            orderByColumn = 'u.name';
        }
        else if (sortColumnParam === 'user_email') {
            orderByColumn = 'u.email';
        }
        else if (sortColumnParam === 'rating') {
            orderByColumn = 'r.rating';
        }
        const ratingsSql = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.address as user_address,
        r.rating,
        r.created_at as rating_date
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY ${orderByColumn} ${order}
    `;
        const ratings = await (0, db_1.query)(ratingsSql, [storeId]);
        res.status(200).json({
            status: 'success',
            data: {
                store,
                averageRating,
                ratingsCount,
                ratings,
            },
        });
    }
    catch (error) {
        console.error('Store owner dashboard error:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getOwnerDashboard = getOwnerDashboard;
