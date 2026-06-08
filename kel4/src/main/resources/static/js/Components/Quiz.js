const Quiz = {
    async renderInModal(quizzes, moduleId) {
        const quizPanel = document.getElementById('module-quiz-area');
        if (!quizPanel) return;
        
        if (!quizzes || quizzes.length === 0) {
            quizPanel.innerHTML = '<p>Belum ada kuis untuk modul ini.</p>';
            return;
        }
        
        let html = '<div style="padding:20px;"><h3>Kuis Modul</h3>';
        
        quizzes.forEach((q, index) => {
            html += `
                <div style="margin-bottom:25px;">
                    <h4>${index + 1}. ${Utils.escapeHtml(q.question)}</h4>
                    ${this.renderOptions(q)}
                </div>
            `;
        });
        
        html += `<button class="btn-primary" onclick="Quiz.submitModalQuiz(${moduleId})">Submit Quiz</button></div>`;
        quizPanel.innerHTML = html;
    },
    
    renderOptions(quiz) {
        const options = ['A', 'B', 'C', 'D'];
        return options.map(opt => `
            <label style="display:block;margin:8px 0;">
                <input type="radio" name="q${quiz.id}" value="${opt}">
                <strong>${opt}.</strong> ${Utils.escapeHtml(quiz[`option${opt}`])}
            </label>
        `).join('');
    },
    
    async submitModalQuiz(moduleId) {
        try {
            const quizzes = await API.getQuizzes(moduleId);
            let score = 0;
            
            quizzes.forEach(quiz => {
                const selected = document.querySelector(`input[name="q${quiz.id}"]:checked`);
                const radios = document.querySelectorAll(`input[name="q${quiz.id}"]`);
                
                radios.forEach(radio => {
                    const label = radio.parentElement;
                    label.style.background = '';
                    label.style.color = '';
                    
                    if (radio.value === quiz.answer) {
                        label.style.backgroundColor = '#2ecc71';
                        label.style.color = 'white';
                    }
                    if (selected && radio.checked && radio.value !== quiz.answer) {
                        label.style.backgroundColor = '#e74c3c';
                        label.style.color = 'white';
                    }
                });
                
                if (selected && selected.value === quiz.answer) {
                    score++;
                }
            });
            
            Utils.showToast(`Nilai kamu: ${score}/${quizzes.length}`, 'success');
        } catch (error) {
            console.error('Quiz submission error:', error);
            Utils.showToast('Error submitting quiz', 'error');
        }
    },
    
    calculateScore(quizzes, answers) {
        let score = 0;
        quizzes.forEach(quiz => {
            const userAnswer = answers.get(`q${quiz.id}`);
            if (userAnswer && userAnswer === quiz.answer) {
                score++;
            }
        });
        return score;
    }
};

window.Quiz = Quiz;