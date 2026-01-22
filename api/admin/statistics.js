import prisma from '../lib/prisma.js';
import { adminOnly } from '../../middleware/auth.js';

async function handler(req, res) {
    // Asumsi: Middleware akan menangani otentikasi dan otorisasi admin.

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const userCount = await prisma.users.count();
        const articleCount = await prisma.articles.count();
        const quizCount = await prisma.quizzes.count();
        
        const bookStats = await prisma.books.aggregate({
            _count: {
                id: true,
            },
            _sum: {
                stock: true,
            },
        });

        const borrowedBooksCount = await prisma.borrowings.count({
            where: {
                returnedAt: null,
            },
        });

        const statistics = {
            users: {
                total: userCount,
            },
            articles: {
                total: articleCount,
            },
            quizzes: {
                total: quizCount,
            },
            books: {
                total: bookStats._count.id,
                totalStock: bookStats._sum.stock || 0,
                currentlyBorrowed: borrowedBooksCount,
            },
        };

        return res.status(200).json(statistics);

    } catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default adminOnly(handler);