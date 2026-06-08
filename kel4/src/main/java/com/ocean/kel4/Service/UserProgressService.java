package com.ocean.kel4.Service;

import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

@Service
public class UserProgressService {

    private static final String PRE_QUIZ_SCORE = "preScore";
    private static final String POST_QUIZ_SCORE = "postScore";
    private static final String PRE_QUIZ_ANSWERS = "preAnswers";
    private static final String POST_QUIZ_ANSWERS = "postAnswers";

    public void savePreQuizResult(HttpSession session, int score, Map<String, String> answers) {
        session.setAttribute(PRE_QUIZ_SCORE, score);
        session.setAttribute(PRE_QUIZ_ANSWERS, answers);
    }

    public void savePostQuizResult(HttpSession session, int score, Map<String, String> answers) {
        session.setAttribute(POST_QUIZ_SCORE, score);
        session.setAttribute(POST_QUIZ_ANSWERS, answers);
    }

    public Integer getPreQuizScore(HttpSession session) {
        return (Integer) session.getAttribute(PRE_QUIZ_SCORE);
    }

    public Integer getPostQuizScore(HttpSession session) {
        return (Integer) session.getAttribute(POST_QUIZ_SCORE);
    }

    public void clearQuizSession(HttpSession session) {
        session.removeAttribute(PRE_QUIZ_SCORE);
        session.removeAttribute(POST_QUIZ_SCORE);
        session.removeAttribute(PRE_QUIZ_ANSWERS);
        session.removeAttribute(POST_QUIZ_ANSWERS);
    }
}