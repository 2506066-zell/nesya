// public/js/auth.js

async function verifyUserLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLogin();
        return null;
    }

    try {
        // Asumsikan kita memiliki endpoint '/api/user/profile' untuk verifikasi token
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user)); // Simpan/update data pengguna
            return user;
        } else {
            // Token tidak valid atau kedaluwarsa
            clearAuthDataAndRedirect();
            return null;
        }
    } catch (error) {
        console.error('Error verifying user login:', error);
        clearAuthDataAndRedirect();
        return null;
    }
}

function redirectToLogin() {
    // Jangan alihkan jika sudah di halaman login
    if (window.location.pathname !== '/login.html' && window.location.pathname !== '/admin/login.html') {
        window.location.href = '/login.html';
    }
}

function clearAuthDataAndRedirect() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    redirectToLogin();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Fungsi untuk melindungi halaman admin
async function protectAdminPage() {
    const user = await verifyUserLogin();
    if (!user || user.role !== 'admin') {
        // Jika bukan admin, bisa dialihkan ke halaman login atau halaman 'unauthorized'
        clearAuthDataAndRedirect();
    }
}