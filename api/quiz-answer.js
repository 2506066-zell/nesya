import prisma from './lib/prisma.js';
import authMiddleware from './middleware/auth.js';

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { userId } = req.user; // Ambil userId dari token
    const { quizId, answers } = req.body; // answers: [{ questionId: string, answer: string }]

    if (!quizId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Quiz ID and answers are required.' });
    }

    try {
        // 1. Ambil pertanyaan dan jawaban yang benar dari database
        const quiz = await prisma.quizzes.findUnique({
            where: { id: quizId },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // 2. Hitung skor
        let score = 0;
        const totalQuestions = quiz.questions.length;

        for (const userAnswer of answers) {
            const question = quiz.questions.find(q => q.id === userAnswer.questionId);
            if (question) {
                const correctAnswer = question.options.find(opt => opt.isCorrect);
                if (correctAnswer && correctAnswer.text === userAnswer.answer) {
                    score++;
                }
            }
        }

        const finalScore = (score / totalQuestions) * 100;

        // 3. Simpan hasil kuis
        await prisma.quiz_Results.create({
            data: {
                quizId,
                userId, // Gunakan userId dari token
                score: finalScore,
                answers: answers, // Simpan jawaban pengguna
            },
        });

        // 4. Kembalikan skor
        return res.status(200).json({ score: finalScore });

    } catch (error) {
        console.error('Error submitting quiz answers:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default authMiddleware(handler);