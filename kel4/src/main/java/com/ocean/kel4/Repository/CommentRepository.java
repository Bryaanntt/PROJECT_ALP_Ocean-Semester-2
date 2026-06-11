package com.ocean.kel4.Repository;

import com.ocean.kel4.Entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByModuleIdOrderByCreatedAtDesc(Long moduleId);
}