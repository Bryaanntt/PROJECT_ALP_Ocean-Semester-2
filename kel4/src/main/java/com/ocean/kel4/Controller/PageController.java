package com.ocean.kel4.Controller;

import com.ocean.kel4.Entity.LearningModule;
import com.ocean.kel4.Entity.ModuleContent;
import com.ocean.kel4.Entity.Quiz;
import com.ocean.kel4.Service.ModuleService;
import com.ocean.kel4.Service.QuizService;
import com.ocean.kel4.Service.UserProgressService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;

@Controller
public class PageController {

    private final ModuleService moduleService;
    private final QuizService quizService;
    private final UserProgressService progressService;

    public PageController(ModuleService moduleService, 
                        QuizService quizService,
                        UserProgressService progressService) {
        this.moduleService = moduleService;
        this.quizService = quizService;
        this.progressService = progressService;
    }

    @GetMapping("/")
    public String home() {
        return "Homepage";
    }

    @GetMapping("/modules")
    public String modulesPage() {
        return "Modules";
    }

    @GetMapping("/tips")
    public String tipsPage() {
        return "Tips";
    }

    @GetMapping("/module/{id}")
    public String moduleDetail(@PathVariable Long id, Model model) {
        LearningModule module = moduleService.getModuleById(id);
        List<ModuleContent> contents = moduleService.getModuleContents(id);
        
        model.addAttribute("module", module);
        model.addAttribute("contents", contents);
        return "ModulesDetail";
    }

    @GetMapping("/prequiz/{moduleId}")
    public String showPreQuiz(@PathVariable Long moduleId, Model model) {
        if (!moduleService.moduleExists(moduleId)) {
            return "redirect:/modules";
        }
        
        List<Quiz> quizzes = quizService.getQuizzesByModuleId(moduleId);
        LearningModule module = moduleService.getModuleById(moduleId);
        
        model.addAttribute("quizzes", quizzes);
        model.addAttribute("moduleId", moduleId);
        model.addAttribute("moduleTitle", module.getTitle());
        return "Quiz";
    }

    @PostMapping("/prequiz/{moduleId}")
    public String submitPreQuiz(@PathVariable Long moduleId,
                                @RequestParam Map<String, String> answers,
                                HttpSession session) {
        List<Quiz> quizzes = quizService.getQuizzesByModuleId(moduleId);
        int score = quizService.calculateScore(quizzes, answers);
        progressService.savePreQuizResult(session, score, answers);
        return "redirect:/module/" + moduleId;
    }

    @GetMapping("/postquiz/{moduleId}")
    public String showPostQuiz(@PathVariable Long moduleId, Model model) {
        if (!moduleService.moduleExists(moduleId)) {
            return "redirect:/modules";
        }
        
        List<Quiz> quizzes = quizService.getQuizzesByModuleId(moduleId);
        LearningModule module = moduleService.getModuleById(moduleId);
        
        model.addAttribute("quizzes", quizzes);
        model.addAttribute("moduleId", moduleId);
        model.addAttribute("moduleTitle", module.getTitle());
        return "PostQuiz";
    }

    @PostMapping("/postquiz/{moduleId}")
    public String submitPostQuiz(@PathVariable Long moduleId,
                                @RequestParam Map<String, String> answers,
                                HttpSession session) {
        List<Quiz> quizzes = quizService.getQuizzesByModuleId(moduleId);
        int score = quizService.calculateScore(quizzes, answers);
        progressService.savePostQuizResult(session, score, answers);
        return "redirect:/result/" + moduleId;
    }

    @GetMapping("/result/{moduleId}")
    public String showResult(@PathVariable Long moduleId, 
                            HttpSession session, 
                            Model model) {
        Integer preScore = progressService.getPreQuizScore(session);
        Integer postScore = progressService.getPostQuizScore(session);
        int totalQuestions = quizService.getTotalQuestions(moduleId);
        
        model.addAttribute("preScore", preScore != null ? preScore : 0);
        model.addAttribute("postScore", postScore != null ? postScore : 0);
        model.addAttribute("totalSoal", totalQuestions);
        model.addAttribute("moduleId", moduleId);
        
        if (moduleService.moduleExists(moduleId)) {
            LearningModule module = moduleService.getModuleById(moduleId);
            model.addAttribute("moduleTitle", module.getTitle());
        }
        
        return "Result";
    }
}