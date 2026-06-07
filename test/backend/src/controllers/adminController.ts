import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth';

export const getStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userCountRes = await query('SELECT COUNT(*) as count FROM users');
    const storeCountRes = await query('SELECT COUNT(*) as count FROM stores');
    const ratingCountRes = await query('SELECT COUNT(*) as count FROM ratings');

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers: userCountRes[0]?.count || 0,
        totalStores: storeCountRes[0]?.count || 0,
        totalRatings: ratingCountRes[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const addUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(400).json({ status: 'fail', message: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        address,
        role,
      },
    });
  } catch (error) {
    console.error('Admin add user error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const addStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;

    // Check if store email exists
    const existingStore = await query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existingStore.length > 0) {
      res.status(400).json({ status: 'fail', message: 'Store email already registered' });
      return;
    }

    // Validate owner if provided
    if (ownerId) {
      const users = await query('SELECT role FROM users WHERE id = ?', [ownerId]);
      if (users.length === 0) {
        res.status(400).json({ status: 'fail', message: 'Selected owner user does not exist' });
        return;
      }

      if (users[0].role !== 'STORE_OWNER') {
        res.status(400).json({ status: 'fail', message: 'Selected owner must have the STORE_OWNER role' });
        return;
      }

      // Check if this owner is already assigned to a store
      const assignedStore = await query('SELECT id FROM stores WHERE owner_id = ?', [ownerId]);
      if (assignedStore.length > 0) {
        res.status(400).json({ status: 'fail', message: 'Selected owner already owns another store' });
        return;
      }
    }

    const result = await query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId || null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Store created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        address,
        ownerId,
      },
    });
  } catch (error) {
    console.error('Admin add store error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    // White-list sorting fields to avoid SQL injection
    const allowedSortBy = ['name', 'email', 'address', 'rating'];
    const allowedSortOrder = ['asc', 'desc'];

    const sortColumn = allowedSortBy.includes(String(sortBy)) ? String(sortBy) : 'name';
    const order = allowedSortOrder.includes(String(sortOrder).toLowerCase())
      ? String(sortOrder).toUpperCase()
      : 'ASC';

    // Build query
    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.owner_id, u.name as owner_name,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (name) {
      whereClauses.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      whereClauses.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      whereClauses.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY s.id';

    // Sort mapping
    if (sortColumn === 'rating') {
      sql += ` ORDER BY rating ${order}`;
    } else {
      sql += ` ORDER BY s.${sortColumn} ${order}`;
    }

    const stores = await query(sql, params);

    // Convert average rating to numeric
    const formattedStores = stores.map((s: any) => ({
      ...s,
      rating: parseFloat(parseFloat(s.rating).toFixed(2)),
    }));

    res.status(200).json({
      status: 'success',
      data: formattedStores,
    });
  } catch (error) {
    console.error('Admin get stores error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const allowedSortBy = ['name', 'email', 'address', 'role', 'rating'];
    const allowedSortOrder = ['asc', 'desc'];

    const sortColumn = allowedSortBy.includes(String(sortBy)) ? String(sortBy) : 'name';
    const order = allowedSortOrder.includes(String(sortOrder).toLowerCase())
      ? String(sortOrder).toUpperCase()
      : 'ASC';

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.address, u.role,
        s.name as store_name,
        COALESCE(AVG(r.rating), 0) as rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (name) {
      whereClauses.push('u.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      whereClauses.push('u.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      whereClauses.push('u.address LIKE ?');
      params.push(`%${address}%`);
    }
    if (role) {
      whereClauses.push('u.role = ?');
      params.push(role);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY u.id';

    if (sortColumn === 'rating') {
      sql += ` ORDER BY rating ${order}`;
    } else {
      sql += ` ORDER BY u.${sortColumn} ${order}`;
    }

    const users = await query(sql, params);

    const formattedUsers = users.map((u: any) => ({
      ...u,
      rating: u.role === 'STORE_OWNER' ? parseFloat(parseFloat(u.rating).toFixed(2)) : null,
    }));

    res.status(200).json({
      status: 'success',
      data: formattedUsers,
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const getAvailableOwners = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // List store owners who do not currently own any store
    const sql = `
      SELECT u.id, u.name, u.email 
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      WHERE u.role = 'STORE_OWNER' AND s.id IS NULL
    `;
    const owners = await query(sql);
    res.status(200).json({ status: 'success', data: owners });
  } catch (error) {
    console.error('Get available owners error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Preventive: Don't allow admin to delete themselves
    if (req.user && req.user.id === parseInt(id)) {
      res.status(400).json({ status: 'fail', message: 'You cannot delete your own admin account' });
      return;
    }

    const result = await query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM stores WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ status: 'fail', message: 'Store not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Store deleted successfully',
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
export const updateStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, address, ownerId } = req.body;

    // Check if store exists
    const store = await query('SELECT id, owner_id FROM stores WHERE id = ?', [id]);
    if (store.length === 0) {
      res.status(404).json({ status: 'fail', message: 'Store not found' });
      return;
    }

    // Check if email is already used by another store
    const emailCheck = await query('SELECT id FROM stores WHERE email = ? AND id != ?', [email, id]);
    if (emailCheck.length > 0) {
      res.status(400).json({ status: 'fail', message: 'Email already used by another store' });
      return;
    }

    // Validate owner if changed/provided
    if (ownerId && ownerId !== store[0].owner_id) {
      const users = await query('SELECT role FROM users WHERE id = ?', [ownerId]);
      if (users.length === 0) {
        res.status(400).json({ status: 'fail', message: 'Selected owner user does not exist' });
        return;
      }

      if (users[0].role !== 'STORE_OWNER') {
        res.status(400).json({ status: 'fail', message: 'Selected owner must have the STORE_OWNER role' });
        return;
      }

      const assignedStore = await query('SELECT id FROM stores WHERE owner_id = ? AND id != ?', [ownerId, id]);
      if (assignedStore.length > 0) {
        res.status(400).json({ status: 'fail', message: 'Selected owner already owns another store' });
        return;
      }
    }

    await query(
      'UPDATE stores SET name = ?, email = ?, address = ?, owner_id = ? WHERE id = ?',
      [name, email, address, ownerId || null, id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Store updated successfully'
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
