package com.ocean.kel4.Service;

import com.ocean.kel4.Entity.Quiz;
import com.ocean.kel4.Repository.QuizRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public List<Quiz> getQuizzesByModuleId(Long moduleId) {
        return quizRepository.findByModuleId(moduleId);
    }

    // PERBAIKAN: userName -> userAnswer
    public int calculateScore(List<Quiz> quizzes, Map<String, String> userAnswers) {
        int score = 0;
        for (Quiz quiz : quizzes) {
            String userAnswer = userAnswers.get("q" + quiz.getId());
            if (quiz.getAnswer() != null && quiz.getAnswer().equalsIgnoreCase(userAnswer)) {
                score++;
            }
        }
        return score;
    }

    public int getTotalQuestions(Long moduleId) {
        return quizRepository.findByModuleId(moduleId).size();
    }

    public Quiz createQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }
}