package com.ocean.kel4.Repository;

import com.ocean.kel4.Entity.ModuleContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ModuleContentRepository extends JpaRepository<ModuleContent, Long> {
    List<ModuleContent> findByModuleIdOrderBySectionOrder(Long moduleId);
}