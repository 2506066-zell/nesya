import prisma from './lib/prisma.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { id } = req.query;

    try {
        if (id) {
            // Mengambil satu kuis beserta pertanyaannya
            const quiz = await prisma.quizzes.findUnique({
                where: { id },
                include: {
                    questions: {
                        select: {
                            id: true,
                            questionText: true,
                            options: true, // Opsi akan menjadi array JSON
                        },
                    },
                },
            });

            if (quiz) {
                // Memastikan 'options' di-parse sebagai JSON dan menghapus 'isCorrect'
                const quizWithSanitizedQuestions = {
                    ...quiz,
                    questions: quiz.questions.map(q => {
                        const options = q.options.map(({ text }) => ({ text }));
                        return { ...q, options };
                    }),
                };
                return res.status(200).json(quizWithSanitizedQuestions);
            } else {
                return res.status(404).json({ message: 'Quiz not found' });
            }
        } else {
            // Mengambil semua kuis
            const quizzes = await prisma.quizzes.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
            });
            return res.status(200).json(quizzes);
        }
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}