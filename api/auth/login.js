import prisma from '../_lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await prisma.users.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Buat JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token berlaku selama 1 jam
        );

        // Jangan kirim password hash ke client
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({ 
            message: 'Login successful', 
            user: userWithoutPassword,
            token: token 
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}