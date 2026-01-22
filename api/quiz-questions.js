const { getDbPool } = require('./lib/db');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Metode ${req.method} tidak diizinkan` });
    }

    const pool = getDbPool();

    try {
        const { rows } = await pool.query('SELECT id, question, options FROM quiz_questions ORDER BY RANDOM()');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Quiz questions API error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};