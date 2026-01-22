import prisma from './lib/prisma.js';
import authMiddleware from './middleware/auth.js';

async function handler(req, res) {
    // userId didapat dari req.user yang di-set oleh authMiddleware
    const { userId } = req.user;
    
    switch (req.method) {
        case 'POST': // Pinjam buku
            return handleBorrow(req, res, userId);
        case 'PUT': // Kembalikan buku
            return handleReturn(req, res);
        default:
            res.setHeader('Allow', ['POST', 'PUT']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}

async function handleBorrow(req, res, userId) {
    const { bookId } = req.body;

    if (!bookId) {
        return res.status(400).json({ message: 'Book ID is required' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const book = await tx.books.findUnique({
                where: { id: bookId },
            });

            if (!book) {
                throw new Error('Book not found');
            }

            if (book.stock <= 0) {
                throw new Error('Book is out of stock');
            }

            // Kurangi stok
            await tx.books.update({
                where: { id: bookId },
                data: { stock: { decrement: 1 } },
            });

            // Buat record peminjaman
            const borrowing = await tx.borrowings.create({
                data: {
                    userId,
                    bookId,
                    borrowedAt: new Date(),
                },
            });

            return borrowing;
        });

        return res.status(201).json(result);

    } catch (error) {
        if (error.message === 'Book not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Book is out of stock') {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error borrowing book:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function handleReturn(req, res) {
    const { borrowingId } = req.body;

    if (!borrowingId) {
        return res.status(400).json({ message: 'Borrowing ID is required' });
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const borrowing = await tx.borrowings.findUnique({
                where: { id: borrowingId },
            });

            if (!borrowing) {
                throw new Error('Borrowing record not found');
            }

            if (borrowing.returnedAt) {
                throw new Error('Book has already been returned');
            }

            // Update record peminjaman
            const updatedBorrowing = await tx.borrowings.update({
                where: { id: borrowingId },
                data: { returnedAt: new Date() },
            });

            // Tambah stok buku
            await tx.books.update({
                where: { id: borrowing.bookId },
                data: { stock: { increment: 1 } },
            });

            return updatedBorrowing;
        });

        return res.status(200).json(result);

    } catch (error) {
        if (error.message === 'Borrowing record not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Book has already been returned') {
            return res.status(409).json({ message: error.message });
        }
        console.error('Error returning book:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export default authMiddleware(handler);