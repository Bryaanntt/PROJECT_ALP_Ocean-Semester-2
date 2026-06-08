package com.ocean.kel4.Repository;

import com.ocean.kel4.Entity.LearningModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModuleRepository extends JpaRepository<LearningModule, Long> {
}