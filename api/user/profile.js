import { authMiddleware } from '../../_middleware/auth.js';
import prisma from '../../_lib/prisma.js';

// Definisikan handler utama untuk rute ini
async function profileHandler(req, res) {
    try {
        // req.user sekarang tersedia berkat middleware
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error in profile handler:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// Bungkus handler dengan middleware dan ekspor hasilnya
export default authMiddleware(profileHandler);