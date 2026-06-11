package com.ocean.kel4.Controller;

import com.ocean.kel4.Entity.Comment;
import com.ocean.kel4.Service.CommentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    private static final DateTimeFormatter FMT =
        DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<Map<String, Object>>> getKomentar(
            @PathVariable Long moduleId) {

        List<Comment> komentar = commentService.getKomentarByModul(moduleId);
        List<Map<String, Object>> result = komentar.stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("username", c.getUsername());
                map.put("content", c.getContent());
                map.put("createdAt", c.getCreatedAt() != null 
                    ? c.getCreatedAt().format(FMT) : "");
                return map;
            })
            .collect(Collectors.toList());
                return ResponseEntity.ok(result);
            }

    @PostMapping("/module/{moduleId}")
    public ResponseEntity<Map<String, Object>> tambahKomentar(
            @PathVariable Long moduleId,
            @RequestBody Map<String, String> body,
            HttpSession session) {

        // Cek login via session
        Long userId = (Long) session.getAttribute("userId");
        String username = (String) session.getAttribute("username");

        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of(
                "sukses", false,
                "pesan",  "Kamu harus login terlebih dahulu untuk berkomentar"
            ));
        }

        CommentService.KomentarResult result = commentService.tambahKomentar(
            moduleId, userId, username, body.get("content")
        );

        return ResponseEntity.ok(Map.of(
            "sukses", result.sukses,
            "pesan",  result.pesan
        ));
    }
}