document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    const articlesTable = document.getElementById('articles-table')?.getElementsByTagName('tbody')[0];
    const articleForm = document.getElementById('article-form');
    const articleIdInput = document.getElementById('article-id');
    const articleTitleInput = document.getElementById('article-title');
    const articleContentInput = document.getElementById('article-content');
    const formTitle = document.getElementById('form-title');
    const cancelButton = document.getElementById('cancel-button');

    const fetchOptions = (method, body = null) => {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        return options;
    };

    const fetchArticles = async () => {
        try {
            const response = await fetch('/api/admin/articles', fetchOptions('GET'));
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/admin/login.html';
                return;
            }
            const articles = await response.json();
            renderArticles(articles);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    const renderArticles = (articles) => {
        if (!articlesTable) return;
        articlesTable.innerHTML = '';
        articles.forEach(article => {
            const row = articlesTable.insertRow();
            row.innerHTML = `
                <td>${article.id}</td>
                <td>${article.title}</td>
                <td>${article.content.substring(0, 50)}...</td>
                <td>${new Date(article.created_at).toLocaleDateString()}</td>
                <td>
                    <button onclick="editArticle(${article.id}, '${article.title}', '${article.content}')">Edit</button>
                    <button onclick="deleteArticle(${article.id})">Delete</button>
                </td>
            `;
        });
    };

    window.editArticle = (id, title, content) => {
        formTitle.textContent = 'Edit Artikel';
        articleIdInput.value = id;
        articleTitleInput.value = title;
        articleContentInput.value = content;
        cancelButton.style.display = 'inline-block';
        window.scrollTo(0, 0);
    };

    window.deleteArticle = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
            try {
                await fetch(`/api/admin/articles?id=${id}`, fetchOptions('DELETE'));
                fetchArticles();
            } catch (error) {
                console.error('Error deleting article:', error);
            }
        }
    };

    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = articleIdInput.value;
            const title = articleTitleInput.value;
            const content = articleContentInput.value;
            const method = id ? 'PUT' : 'POST';
            const body = { id, title, content };

            try {
                await fetch('/api/admin/articles', fetchOptions(method, body));
                resetForm();
                fetchArticles();
            } catch (error) {
                console.error('Error saving article:', error);
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            resetForm();
        });
    }

    const resetForm = () => {
        formTitle.textContent = 'Tambah Artikel Baru';
        articleIdInput.value = '';
        articleForm.reset();
        cancelButton.style.display = 'none';
    };

    if (window.location.pathname.endsWith('articles.html')) {
        fetchArticles();
    }
});