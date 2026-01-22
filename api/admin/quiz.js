import prisma from '../_lib/prisma.js';
import { adminOnly } from '../_middleware/auth.js';

async function handler(req, res) {
    // Asumsi: Middleware akan menangani otentikasi dan otorisasi.

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

// Membuat kuis baru beserta pertanyaannya
async function handlePost(req, res) {
    const { title, description, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'Title and at least one question are required.' });
    }

    try {
        const quiz = await prisma.quizzes.create({
            data: {
                title,
                description,
                questions: {
                    create: questions.map(q => ({
                        questionText: q.questionText,
                        options: q.options, // { text: string, isCorrect: boolean }[]
                    })),
                },
            },
            include: {
                questions: true,
            },
        });
        return res.status(201).json(quiz);
    } catch (error) {
        console.error('Error creating quiz:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Memperbarui kuis dan pertanyaannya
async function handlePut(req, res) {
    const { id } = req.query;
    const { title, description, questions } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Quiz ID is required' });
    }

    try {
        // Transaksi untuk update: hapus pertanyaan lama, buat yang baru
        const [, updatedQuiz] = await prisma.$transaction([
            prisma.questions.deleteMany({ where: { quizId: id } }),
            prisma.quizzes.update({
                where: { id },
                data: {
                    title,
                    description,
                    questions: {
                        create: questions.map(q => ({
                            questionText: q.questionText,
                            options: q.options,
                        })),
                    },
                },
                include: {
                    questions: true,
                },
            }),
        ]);

        return res.status(200).json(updatedQuiz);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        console.error('Error updating quiz:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Menghapus kuis
async function handleDelete(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'Quiz ID is required' });
    }

    try {
        // onDelete: Cascade akan menghapus Questions dan Quiz_Results terkait
        await prisma.quizzes.delete({
            where: { id },
        });
        return res.status(204).end();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        console.error('Error deleting quiz:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}