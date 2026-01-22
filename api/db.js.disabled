require('dotenv').config();
const { getDbPool } = require('./lib/db'); // Menggunakan pool
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  const pool = getDbPool();
  const client = await pool.connect(); // Mengambil koneksi dari pool

  try {
    console.log('Memulai setup database...');

    // Menghapus tabel 'users' jika ada, untuk memastikan skema terbaru.
    // Aman dilakukan selama tahap pengembangan.
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('Tabel "users" lama (jika ada) telah dihapus.');

    // Menghapus tabel kuis lama untuk pembaruan skema
    await client.query('DROP TABLE IF EXISTS quiz_answers CASCADE;');
    console.log('Tabel "quiz_answers" lama (jika ada) telah dihapus.');
    await client.query('DROP TABLE IF EXISTS quiz_questions CASCADE;');
    console.log('Tabel "quiz_questions" lama (jika ada) telah dihapus.');

    // 1. Tabel Users (Disesuaikan)
    // Menggunakan UUID untuk ID, dan username untuk login.
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabel "users" siap.');

    // 2. Tabel Articles (Disesuaikan)
    // Menggunakan UUID untuk ID agar konsisten.
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabel "articles" siap.');

    // 3. Tabel Quiz Questions (DIPERBARUI)
    // Skema disesuaikan dengan kebutuhan fitur admin kuis.
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabel "quiz_questions" siap.');

    // 4. Tabel Quiz Answers (Disesuaikan)
    // Disesuaikan agar konsisten dengan quiz_questions yang baru.
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
        answer VARCHAR(255) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        UNIQUE(user_id, question_id)
      );
    `);
    console.log('Tabel "quiz_answers" siap.');

    // 5. Tabel Books (Tetap)
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        stock INTEGER NOT NULL
      );
    `);
    console.log('Tabel "books" siap.');

    // 6. Tabel Borrowings (Tetap)
    await client.query(`
      CREATE TABLE IF NOT EXISTS borrowings (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        book_id INTEGER REFERENCES books(id),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabel "borrowings" siap.');

    // 7. Menambahkan Admin Default (Logika Baru)
    const adminUsername = 'admin';
    const adminResult = await client.query('SELECT * FROM users WHERE username = $1', [adminUsername]);

    if (adminResult.rowCount === 0) {
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [adminUsername, hashedPassword, 'admin']
      );
      console.log('User admin default berhasil dibuat.');
      console.log(`-> Username: ${adminUsername}`);
      console.log(`-> Password: ${adminPassword} (Gunakan ini untuk login pertama kali)`);
    } else {
      console.log('User admin sudah ada, tidak ada yang ditambahkan.');
    }

    console.log('Setup database selesai.');

  } catch (error) {
    console.error('Error saat setup database:', error);
    throw error;
  } finally {
    client.release(); // Melepaskan koneksi kembali ke pool
    console.log('Koneksi ke database dilepaskan.');
  }
}

// Pola eksekusi standar untuk skrip yang bisa dijalankan langsung
if (require.main === module) {
  setupDatabase().catch(err => {
    console.error('Gagal menjalankan skrip inisialisasi database:', err);
    process.exit(1);
  }).finally(() => {
    // Pastikan pool ditutup setelah skrip selesai
    const pool = getDbPool();
    pool.end();
  });
}

module.exports = { setupDatabase };