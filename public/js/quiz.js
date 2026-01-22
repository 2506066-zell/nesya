document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    const quizTable = document.getElementById('quiz-table')?.getElementsByTagName('tbody')[0];
    const quizForm = document.getElementById('quiz-form');
    const quizIdInput = document.getElementById('quiz-id');
    const quizQuestionInput = document.getElementById('quiz-question');
    const optionAInput = document.getElementById('option-a');
    const optionBInput = document.getElementById('option-b');
    const optionCInput = document.getElementById('option-c');
    const optionDInput = document.getElementById('option-d');
    const correctOptionInput = document.getElementById('correct-option');
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

    const fetchQuestions = async () => {
        try {
            const response = await fetch('/api/admin/quiz', fetchOptions('GET'));
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/admin/login.html';
                return;
            }
            const questions = await response.json();
            renderQuestions(questions);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const renderQuestions = (questions) => {
        if (!quizTable) return;
        quizTable.innerHTML = '';
        questions.forEach(q => {
            const row = quizTable.insertRow();
            row.innerHTML = `
                <td>${q.question.substring(0, 50)}...</td>
                <td>${q.option_a}</td>
                <td>${q.option_b}</td>
                <td>${q.option_c}</td>
                <td>${q.option_d}</td>
                <td>${q.correct}</td>
                <td>
                    <button onclick="editQuestion('${q.id}', '${q.question}', '${q.option_a}', '${q.option_b}', '${q.option_c}', '${q.option_d}', '${q.correct}')">Edit</button>
                    <button onclick="deleteQuestion('${q.id}')">Delete</button>
                </td>
            `;
        });
    };

    window.editQuestion = (id, question, optA, optB, optC, optD, correct) => {
        formTitle.textContent = 'Edit Soal';
        quizIdInput.value = id;
        quizQuestionInput.value = question;
        optionAInput.value = optA;
        optionBInput.value = optB;
        optionCInput.value = optC;
        optionDInput.value = optD;
        correctOptionInput.value = correct;
        cancelButton.style.display = 'inline-block';
        window.scrollTo(0, 0);
    };

    window.deleteQuestion = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
            try {
                await fetch(`/api/admin/quiz?id=${id}`, fetchOptions('DELETE'));
                fetchQuestions();
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    if (quizForm) {
        quizForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = quizIdInput.value;
            const body = {
                question: quizQuestionInput.value,
                option_a: optionAInput.value,
                option_b: optionBInput.value,
                option_c: optionCInput.value,
                option_d: optionDInput.value,
                correct: correctOptionInput.value
            };
            
            const url = id ? `/api/admin/quiz?id=${id}` : '/api/admin/quiz';
            const method = id ? 'PUT' : 'POST';

            try {
                await fetch(url, fetchOptions(method, body));
                resetForm();
                fetchQuestions();
            } catch (error) {
                console.error('Error saving question:', error);
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            resetForm();
        });
    }

    const resetForm = () => {
        formTitle.textContent = 'Tambah Soal Baru';
        quizIdInput.value = '';
        quizForm.reset();
        cancelButton.style.display = 'none';
    };

    if (window.location.pathname.endsWith('quiz.html')) {
        fetchQuestions();
    }
});