import prisma from './_lib/prisma.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;

    try {
        if (id) {
            // Mengambil satu artikel berdasarkan ID
            const article = await prisma.articles.findUnique({
                where: { id },
            });
            if (article) {
                return res.status(200).json(article);
            } else {
                return res.status(404).json({ message: 'Article not found' });
            }
        } else {
            // Mengambil semua artikel
            const articles = await prisma.articles.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return res.status(200).json(articles);
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}