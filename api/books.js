import prisma from './lib/prisma.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const books = await prisma.books.findMany({
            orderBy: {
                title: 'asc',
            },
        });
        return res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}