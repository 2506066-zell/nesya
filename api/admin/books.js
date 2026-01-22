import prisma from '../lib/prisma.js';
import { adminOnly } from '../../middleware/auth.js';

async function handler(req, res) {
    // Asumsi: Middleware akan menangani otentikasi dan otorisasi.

    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        case 'PUT':
            return handlePut(req, res);
        case 'DELETE':
            return handleDelete(req, res);
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

export default adminOnly(handler);

// Mendapatkan semua buku
async function handleGet(req, res) {
    try {
        const books = await prisma.books.findMany({
            orderBy: { title: 'asc' },
            include: {
                borrowings: {
                    where: { returnedAt: null },
                    select: { userId: true }
                }
            }
        });
        return res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books for admin:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Menambahkan buku baru
async function handlePost(req, res) {
    const { title, author, stock } = req.body;

    if (!title || !author || stock === undefined) {
        return res.status(400).json({ message: 'Title, author, and stock are required' });
    }

    try {
        const book = await prisma.books.create({
            data: { title, author, stock: parseInt(stock, 10) },
        });
        return res.status(201).json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Memperbarui buku
async function handlePut(req, res) {
    const { id } = req.query;
    const { title, author, stock } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Book ID is required' });
    }

    try {
        const book = await prisma.books.update({
            where: { id },
            data: {
                title,
                author,
                stock: stock !== undefined ? parseInt(stock, 10) : undefined,
            },
        });
        return res.status(200).json(book);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Book not found' });
        }
        console.error('Error updating book:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Menghapus buku
async function handleDelete(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Book ID is required' });
    }

    try {
        // onDelete: Cascade akan menghapus Borrowings terkait
        await prisma.books.delete({
            where: { id },
        });
        return res.status(204).end();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Book not found' });
        }
        console.error('Error deleting book:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}