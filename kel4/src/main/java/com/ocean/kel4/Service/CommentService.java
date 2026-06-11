package com.ocean.kel4.Service;

import com.ocean.kel4.Entity.Comment;
import com.ocean.kel4.Repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final WordFilterService wordFilterService;

    public CommentService(CommentRepository commentRepository,
                        WordFilterService wordFilterService) {
        this.commentRepository = commentRepository;
        this.wordFilterService = wordFilterService;
    }

    public static class KomentarResult {
        public final boolean sukses;
        public final String pesan;
        public final Comment comment;
        public KomentarResult(boolean sukses, String pesan, Comment comment) {
            this.sukses = sukses; this.pesan = pesan; this.comment = comment;
        }
    }

    public List<Comment> getKomentarByModul(Long moduleId) {
        return commentRepository.findByModuleIdOrderByCreatedAtDesc(moduleId);
    }

    public KomentarResult tambahKomentar(Long moduleId, Long userId,
                                        String username, String content) {
        if (content == null || content.isBlank())
            return new KomentarResult(false, "Komentar tidak boleh kosong", null);
        if (content.length() > 500)
            return new KomentarResult(false, "Komentar maksimal 500 karakter", null);
        if (wordFilterService.mengandungKataTerlarang(content))
            return new KomentarResult(false,
                "Komentar mengandung kata yang tidak pantas. Harap gunakan bahasa yang sopan.", null);

        Comment comment = new Comment();
        comment.setModuleId(moduleId);
        comment.setUserId(userId);
        comment.setUsername(username);
        comment.setContent(wordFilterService.sensorTeks(content));
        commentRepository.save(comment);

        return new KomentarResult(true, "Komentar berhasil ditambahkan", comment);
    }
}