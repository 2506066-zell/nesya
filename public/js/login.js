document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageDiv = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageDiv.textContent = '';
        messageDiv.style.display = 'none';

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login gagal.');
            }

            // Simpan token ke localStorage
            localStorage.setItem('token', data.token);
            // Simpan juga data user jika perlu
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect berdasarkan role
            if (data.user.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/user/home.html';
            }

        } catch (error) {
            messageDiv.textContent = error.message;
            messageDiv.style.display = 'block';
        }
    });
});