// api/user/profile.js
import { authMiddleware } from '../../_middleware/auth.js';
import prisma from '../../_lib/prisma.js';

export default async function handler(req, res) {
    // Terapkan middleware otentikasi
    authMiddleware(req, res, async () => {
        try {
            // req.user dilampirkan oleh authMiddleware setelah verifikasi token berhasil
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Hapus password dari objek user sebelum mengirimkannya kembali
            const { password, ...userWithoutPassword } = user;

            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    });
}