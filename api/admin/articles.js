import prisma from '../lib/prisma.js';
import { adminOnly } from '../../middleware/auth.js';

async function handler(req, res) {
    // Asumsi: Middleware akan menangani otentikasi dan otorisasi.
    // Di sini kita hanya fokus pada logika CRUD.

    switch (req.method) {
        case 'POST':
            return handlePost(req, res);
        case 'PUT':
            return handlePut(req, res);
        case 'DELETE':
            return handleDelete(req, res);
        default:
            res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

export default adminOnly(handler);

async function handlePost(req, res) {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.status(400).json({ message: 'Title, content, and author are required' });
    }

    try {
        const article = await prisma.articles.create({
            data: { title, content, author },
        });
        return res.status(201).json(article);
    } catch (error) {
        console.error('Error creating article:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function handlePut(req, res) {
    const { id } = req.query;
    const { title, content, author } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Article ID is required' });
    }

    try {
        const article = await prisma.articles.update({
            where: { id },
            data: { title, content, author },
        });
        return res.status(200).json(article);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Article not found' });
        }
        console.error('Error updating article:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function handleDelete(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Article ID is required' });
    }

    try {
        await prisma.articles.delete({
            where: { id },
        });
        return res.status(204).end(); // No Content
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Article not found' });
        }
        console.error('Error deleting article:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}