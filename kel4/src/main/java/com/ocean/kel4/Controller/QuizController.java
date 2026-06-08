package com.ocean.kel4.Controller;

import com.ocean.kel4.Entity.Quiz;
import com.ocean.kel4.Service.QuizService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/module/{moduleId}")
    public List<Quiz> getQuizzesByModule(@PathVariable Long moduleId) {
        return quizService.getQuizzesByModuleId(moduleId);
    }

    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizService.createQuiz(quiz);
    }

    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
    }
}