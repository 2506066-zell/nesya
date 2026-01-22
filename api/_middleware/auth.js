import jwt from 'jsonwebtoken';

const authMiddleware = (handler) => (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Tambahkan payload token ke request
        return handler(req, res);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

export const adminOnly = (handler) => authMiddleware((req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only.' });
    }
    return handler(req, res);
});

export default authMiddleware;