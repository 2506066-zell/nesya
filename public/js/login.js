document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

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

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Login gagal.');
            }

            // Simpan data user ke localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect berdasarkan role
            if (data.user.role === 'admin') {
                window.location.href = '/admin/dashboard.html'; // Path absolut dari root
            } else {
                window.location.href = '/user/home.html'; // Path absolut dari root
            }

        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        }
    });
});